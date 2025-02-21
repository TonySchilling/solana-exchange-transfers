from flask import Flask, request, jsonify, render_template
import requests
import pandas as pd
import json
from utilities import *

df = pd.read_csv('static/transferData.csv')
df['blockTime']=pd.to_datetime(df['blockTime'])
df=addRoundedFields(df)

app = Flask(__name__)

@app.route('/')
def home():

    return render_template('index.html')


@app.route('/getAggregated', methods=['POST'])
def getAggregated():

    data=request.json
    gf=aggregateTransferData(df, data)
    gf=queryAggregatedData(gf, data)
    results = gf.to_dict(orient='records')
    # print(results[0])
    # print(data)
    # results={'message':'success'}

    
    return jsonify(results)

@app.route('/requestTransfers', methods=['POST'])
def requestTransfers():

    data=request.json
    tf=returnTransfers(data, df)
    results = tf.to_dict(orient='records')
    with open('test.csv', 'w') as f:
        f.write(json.dumps(data))
    # print(data)
    # results={'message':'success'}

    
    return jsonify(results)

if __name__=='__main__':
    app.run(debug=True)