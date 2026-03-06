# ruff: noqa: Q000
"""Contains the lambda response functions and headers

Returns:
    dict: The lambda response
"""

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
}

class RESPONSE:
    @staticmethod
    def success(data: dict, status_code: int = 200, headers: dict = HEADERS) -> dict:
        return {
            'statusCode': status_code,
            'headers': headers,
            'body': data,
        }

    @staticmethod
    def error(message: str, status_code: int = 500, headers: dict = HEADERS) -> dict:
        return {
            'statusCode': status_code,
            'headers': headers,
            'body': {
                'message': message,
            },
        }


# def RESPONSE(body: dict, status_code: int = 200, headers: dict = HEADERS) -> dict:
#     return {
#         'statusCode': status_code,
#         'headers': headers,
#         'body': body,
#     }
