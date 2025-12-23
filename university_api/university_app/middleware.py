from django.http import HttpResponse

class CORSMiddleware:
    """
    Custom CORS middleware to add Access-Control-Allow-Origin header
    to all responses. Use when django-cors-headers doesn't work.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle OPTIONS preflight requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self._add_cors_headers(response)
            return response
        
        response = self.get_response(request)
        self._add_cors_headers(response)
        return response
    
    def _add_cors_headers(self, response):
        """Add CORS headers to response"""
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Origin'
        response['Access-Control-Max-Age'] = '3600'
        return response
