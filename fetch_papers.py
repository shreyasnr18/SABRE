import urllib.request
import json
import urllib.parse

def fetch_openalex():
    query = "multi-agent AND dynamic vehicle routing"
    url = f"https://api.openalex.org/works?search={urllib.parse.quote(query)}&filter=has_fulltext:true,is_oa:true,publication_year:>2018&sort=relevance_score:desc&per-page=5"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'SABRE-Research/1.0 (mailto:test@example.com)'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        print("## Academic Papers (Open Access):")
        for work in data.get('results', []):
            title = work.get('title')
            year = work.get('publication_year')
            doi = work.get('doi')
            authors = [a['author']['display_name'] for a in work.get('authorships', []) if 'author' in a]
            oa_url = work.get('open_access', {}).get('oa_url', 'No direct PDF link')
            
            print(f"- **{title}** ({year})")
            print(f"  *Authors:* {', '.join(authors)}")
            print(f"  *DOI/Link:* {doi}")
            print(f"  *PDF:* {oa_url}\n")

fetch_openalex()
