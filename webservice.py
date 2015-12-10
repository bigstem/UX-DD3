from flask import Flask, jsonify, abort, request
import flask_cors
import json

app = Flask(__name__)

DATA_PATH = 'data/'

@app.before_request
def option_autoreply():
    """ Always reply 200 on OPTIONS request """

    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()

        headers = None
        if 'ACCESS_CONTROL_REQUEST_HEADERS' in request.headers:
            headers = request.headers['ACCESS_CONTROL_REQUEST_HEADERS']

        h = resp.headers

        # Allow the origin which made the XHR
        h['Access-Control-Allow-Origin'] = request.headers['Origin']
        # Allow the actual method
        h['Access-Control-Allow-Methods'] = request.headers['Access-Control-Request-Method']
        # Allow for 10 seconds
        h['Access-Control-Max-Age'] = "10"

        # We also keep current headers
        if headers is not None:
            h['Access-Control-Allow-Headers'] = headers

        return resp


@app.after_request
def set_allow_origin(resp):
    """ Set origin for GET, POST, PUT, DELETE requests """

    h = resp.headers

    # Allow crossdomain for other HTTP Verbs
    if request.method != 'OPTIONS' and 'Origin' in request.headers:
        h['Access-Control-Allow-Origin'] = request.headers['Origin']


    return resp

@app.route('/dd3/examples', methods = ['GET'])
@flask_cors.cross_origin(headers=['Access-Control-Allow-Origin:*'])
def get_task():
    url = request.args.get('url').split('/')[-1].split('.')[0]
    j = json.load(open(DATA_PATH + {'Example-Area': 'static_data.json', 'Example-BootstrapTable': 'tabledata1.json', 'Example-Bubble':'bubble.json', 'Example-Chord':'chord.json', 'Example-Circle_Packing':'circle_packing.json', 'Example-donut':'Pie.json', 'Example-Force-layout':'force.json', 'Example-Force_layout_with_arrow_links':'force.json', 'Example-Grouped-Histogram':'ts_data.json', 'Example-Histogram':'static_data.json', 'Example-line':'line.json', 'Example-Pie':'Pie.json', 'Example-Scatterplot':'ts_data.json', 'Example-Tree':'loanWB20150115.json', 'Example-Vertical_Tree':'vertical_tree.json', 'Example-Zoomable_Circle':'circle_packing.json'}[url], 'rb'))
    return json.dumps(j)
	
if __name__ == '__main__':
	
    #app.run(debug=True, host='10.26.154.192', port=9100)
    app.run(debug=True, host='127.0.0.1', port=9200)
