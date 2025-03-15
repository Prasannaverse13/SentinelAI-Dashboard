import axios from 'axios';

interface ScanResult {
  ports: number[];
  services: any[];
  vulnerabilities: any[];
  headers?: any;
  dnsInfo?: any;
  sslData?: any;
}

async function checkSSL(hostname: string) {
  try {
    const response = await axios.get(`https://api.ssllabs.com/api/v3/analyze`, {
      params: {
        host: hostname,
        publish: 'off',
        startNew: 'on',
        all: 'done',
        ignoreMismatch: 'on'
      }
    });

    if (response.data.status === 'READY' || response.data.status === 'ERROR') {
      return {
        valid: response.data.status === 'READY',
        daysRemaining: response.data.endpoints?.[0]?.details?.cert?.notAfter 
          ? Math.floor((new Date(response.data.endpoints[0].details.cert.notAfter).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        protocols: response.data.endpoints?.[0]?.details?.protocols?.map((p: any) => p.name + p.version) || [],
        grade: response.data.endpoints?.[0]?.grade || 'Unknown'
      };
    }

    return {
      valid: true,
      daysRemaining: null,
      protocols: [],
      grade: 'Unknown'
    };
  } catch (error) {
    return {
      valid: false,
      daysRemaining: null,
      protocols: [],
      grade: 'Unknown'
    };
  }
}

export async function performSecurityScan(target: string): Promise<ScanResult> {
  try {
    const results: ScanResult = {
      ports: [],
      services: [],
      vulnerabilities: []
    };

    // Basic reachability check with both HTTP and HTTPS
    let isHttps = false;
    try {
      await axios.get(`https://${target}`, { timeout: 5000 });
      isHttps = true;
    } catch (error: any) {
      try {
        await axios.get(`http://${target}`, { timeout: 5000 });
      } catch (httpError: any) {
        if (!httpError.response) {
          throw new Error('Target is not reachable via HTTP or HTTPS');
        }
      }
    }

    // Port scanning using Shodan API
    try {
      const shodanResponse = await axios.get(`https://internetdb.shodan.io/${target}`);
      if (shodanResponse.data.ports) {
        results.ports = shodanResponse.data.ports;
        
        const dangerousPorts = [21, 23, 3389, 445, 135, 137, 138, 139];
        const openDangerousPorts = results.ports.filter(port => dangerousPorts.includes(port));
        
        if (openDangerousPorts.length > 0) {
          results.vulnerabilities.push({
            name: 'Potentially Dangerous Ports Open',
            description: `The following potentially dangerous ports are open: ${openDangerousPorts.join(', ')}`,
            severity: 'high',
            service: 'Network',
            port: openDangerousPorts[0],
            exploitable: true
          });
        }
      }
    } catch (error) {
      console.warn('Shodan scan failed:', error);
    }

    // Service detection and banner grabbing
    for (const port of results.ports) {
      try {
        const serviceResponse = await axios.get(`http://${target}:${port}`, {
          timeout: 2000,
          validateStatus: null
        });
        
        const service = {
          port,
          service: serviceResponse.headers?.server || 'unknown',
          banner: serviceResponse.headers,
          version: serviceResponse.headers?.server?.split('/')[1] || null
        };
        
        results.services.push(service);

        if (service.version) {
          const versionNumber = parseInt(service.version.split('.')[0]);
          if (versionNumber < 2) {
            results.vulnerabilities.push({
              name: 'Outdated Service Version',
              description: `Service ${service.service} is running an outdated version (${service.version})`,
              severity: 'medium',
              service: service.service,
              port: port,
              exploitable: true
            });
          }
        }
      } catch (error) {
        continue;
      }
    }

    // SSL/TLS analysis for HTTPS
    if (isHttps) {
      try {
        const sslData = await checkSSL(target);
        results.sslData = sslData;
        
        if (sslData.daysRemaining && sslData.daysRemaining < 30) {
          results.vulnerabilities.push({
            name: 'SSL Certificate Expiring Soon',
            description: `SSL certificate will expire in ${sslData.daysRemaining} days`,
            severity: 'medium',
            service: 'HTTPS',
            port: 443
          });
        }

        if (sslData.grade && sslData.grade.startsWith('B') || sslData.grade.startsWith('C')) {
          results.vulnerabilities.push({
            name: 'Weak SSL Configuration',
            description: `SSL configuration received grade ${sslData.grade}`,
            severity: 'medium',
            service: 'HTTPS',
            port: 443,
            exploitable: false
          });
        } else if (sslData.grade && (sslData.grade.startsWith('D') || sslData.grade.startsWith('F'))) {
          results.vulnerabilities.push({
            name: 'Critical SSL Configuration',
            description: `SSL configuration received grade ${sslData.grade}`,
            severity: 'high',
            service: 'HTTPS',
            port: 443,
            exploitable: true
          });
        }

        const weakProtocols = sslData.protocols.filter((p: string) => 
          p.includes('SSLv3') || p.includes('TLSv1.0') || p.includes('TLSv1.1')
        );
        
        if (weakProtocols.length > 0) {
          results.vulnerabilities.push({
            name: 'Weak SSL/TLS Protocols',
            description: `Server supports deprecated protocols: ${weakProtocols.join(', ')}`,
            severity: 'high',
            service: 'HTTPS',
            port: 443,
            exploitable: true
          });
        }
      } catch (error) {
        console.warn('SSL check failed:', error);
        results.vulnerabilities.push({
          name: 'SSL Certificate Issues',
          description: 'Unable to verify SSL certificate',
          severity: 'medium',
          service: 'HTTPS',
          port: 443
        });
      }
    }

    // Security headers check
    try {
      const headersResponse = await axios.get(`${isHttps ? 'https' : 'http'}://${target}`, {
        validateStatus: null,
        timeout: 5000
      });
      
      results.headers = headersResponse.headers;
      
      const securityHeaders = {
        'Strict-Transport-Security': {
          description: 'Missing HSTS header',
          severity: 'high'
        },
        'X-Frame-Options': {
          description: 'Missing clickjacking protection',
          severity: 'medium'
        },
        'X-Content-Type-Options': {
          description: 'Missing MIME-type protection',
          severity: 'medium'
        },
        'Content-Security-Policy': {
          description: 'Missing CSP header',
          severity: 'high'
        },
        'X-XSS-Protection': {
          description: 'Missing XSS protection header',
          severity: 'medium'
        }
      };

      for (const [header, info] of Object.entries(securityHeaders)) {
        if (!headersResponse.headers[header.toLowerCase()]) {
          results.vulnerabilities.push({
            name: `Missing ${header}`,
            description: info.description,
            severity: info.severity,
            service: 'HTTP',
            port: isHttps ? 443 : 80,
            exploitable: info.severity === 'high'
          });
        }
      }
    } catch (error) {
      console.warn('Headers check failed:', error);
    }

    // CVE lookup for detected services
    for (const service of results.services) {
      if (service.service !== 'unknown' && service.version) {
        try {
          const cveResponse = await axios.get(
            `https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=${encodeURIComponent(service.service + service.version)}`
          );
          
          const cves = cveResponse.data.vulnerabilities || [];
          
          for (const cve of cves) {
            const cvssScore = cve.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore;
            
            if (cvssScore && cvssScore >= 7.0) {
              results.vulnerabilities.push({
                name: cve.cve.id,
                description: cve.cve.descriptions[0]?.value || 'No description available',
                severity: cvssScore >= 9.0 ? 'critical' : 'high',
                service: service.service,
                port: service.port,
                exploitable: true,
                cve: {
                  id: cve.cve.id,
                  score: cvssScore,
                  vector: cve.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.vectorString
                }
              });
            }
          }
        } catch (error) {
          console.warn('CVE lookup failed:', error);
        }
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`Scan failed: ${error.message}`);
  }
}