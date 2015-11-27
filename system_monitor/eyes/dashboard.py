from django.shortcuts import render
from django import http
from django.core import serializers
from django.utils.text import compress_string
from bson import json_util

import re,os
import json
import datetime
import time
from models import *
from pymongo import MongoClient

from bson.code import Code

import sys
sys.path.append("/data/migo/athena/lib")
from athena_variable import *

XS_SHARING_ALLOWED_ORIGINS = "*"
XS_SHARING_ALLOWED_METHODS = ["POST","GET","OPTIONS", "PUT", "DELETE"]

JSON_RES = {"Code":0, "Msg":"", "CATEGORY":"", "IDX":-1, "NAME":"", "DATA":{}}
COLLECTION = ["ProjectReport_StarterDIY","DIYReport","DIYReportG","TopItem","DashBoardMember","DashBoardRevenue","TAItem","KPIAlert"]

def _response(data, is_encoded):
    if not is_encoded:
        data = json.dumps(data, ensure_ascii="False")

    response = http.HttpResponse(data)
    response.__setitem__("Content-type", "application/json; charset=utf-8")
    response.__setitem__("Access-Control-Allow-Origin", "*")
    response.__setitem__("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
    response.__setitem__("Access-Control-Allow-Headers", "*")

    return response
    #return http.HttpResponse(data, content_type="application/json; charset=utf-8")

def oclient():
    client = MongoClient(MIGO_MONGO_TA_URL, MIGO_MONGO_PORT)
    return client

def getclient(request):
    is_encoded = False
    r = dict(JSON_RES)
    arr = {}

    client = oclient()
    db = client.ProjectBasicInfo
    coll = db.Store
    list = coll.find().distinct("ShopID")
    client.close()
    arr["Data"] = list
    return _response(arr, is_encoded)

def getinfo(request, shopid):
    is_encoded = False
    r = dict(JSON_RES)
    arr = {}
    #get all collection counts
    dbname = COLLECTION[0]
    client = oclient()
    db = client[dbname]
    arr['ShopID'] = shopid
    for idx, val in enumerate(COLLECTION):
        if idx > 0:
            col = db[val]
            DD = getdate(shopid, col)
            a = col.find({'ShopID': shopid })
            arr[val] = {
                "max":DD[0] if DD[0] != "" else "null",
                "min":DD[1] if DD[1] != "" else "null",
                "Counts":a.count()
            }
    client.close()
    return _response(arr, is_encoded)

def gettask(request, caldate):
    is_encoded = False
    r = dict(JSON_RES)
    #hostname = sh.ssh.bake("root@10.0.1.13")
    prog = "/data/migo/athena/lib/util/monitor.py"
    prog = "/tmp/tt.sh"
    #prog = "/home/wendell/Spark/ta_query.py"
    #cmd = "ssh root@{0} su athena {1} -d {2}".format('10.10.21.51', prog, caldate)
    cmd = "su athena -c 'ssh athena@{} {} -d {}'".format('10.10.21.51', prog, caldate)
    print cmd
    data = os.popen(cmd).read().strip() 
    paths = data.split("\n")
    DICTS = {}
    for path in paths:
        info = path[1:].split('/')
        if info[2] in DICTS.keys():
            if info[3] in DICTS[info[2]].keys():
                DICTS[info[2]][info[3]] = True
            else:
                DICTS[info[2]][info[3]] = True
        else:
            DICTS[info[2]] = {info[3] :True }
    return _response(DICTS, is_encoded)

def getdate(shopid, col):
    is_encoded = False
    r = dict(JSON_RES)
    min = col.find({'ShopID': shopid}).sort('CalDate',1).limit(1)
    max = col.find({'ShopID': shopid}).sort('CalDate',-1).limit(1)
    ma = ""
    mi = ""
    for x in min:
        try:
            mi = str(x["CalDate"])
        except:
            mi = str(x["LastEditDate"])
    for x in max:
        try:
            ma = str(x["CalDate"])
        except:
            ma = str(x["LastEditDate"])
    return ma , mi

def getsrc(request, shopid):
    is_encoded = False
    r = dict(JSON_RES)
    Q = ['Store','Member','Item']
    arr = {}
    client = oclient()
    db = client['ProjectBasicInfo']
    for idx, val in enumerate(Q):
        mm = None
        int = 0
        if idx == 0:
            col = db[val]
            if col:
                R = col.find({'ShopID': shopid})
                int = R.count()
                max = col.find({'ShopID': shopid}).sort('_id',-1).limit(1)
                for x in max:
                    mm = x["_id"].generation_time + datetime.timedelta(hours=8)
            else:
                pass
        else:
            col = db[val + '_' + shopid]
            if col:
                max = col.find().sort('_id',-1).limit(1)
                for x in max :
                    mm = x["_id"].generation_time + datetime.timedelta(hours=8)
                R = col.find()
                int = R.count()
            else:
                pass
        arr[val] = {
            'Counts':str(int),
            'LastDate':str(mm)
        }
    client.close()
    return _response(arr, is_encoded)

def getlog(request, mode, collection, shopid):
    is_encoded = False
    print shopid , collection
    r = dict(JSON_RES)
    client = oclient()
    db = client.ProjectReport_StarterDIY
    col = db[collection]

    key = ['CalDate']
    condition = {}
    if mode == 'w':
        condition = {'PeriodType':'L7D'}
    else:
        condition = {'PeriodType':{'$ne':'L7D'}}

    initial = {'count':0 }
    reduce = 'function(doc, out) { out.count++; }'
    rr = col.group(key, condition, initial, reduce)
    all = []
    for x in rr:
        obj = {'date':str(x['CalDate'])[0:10] , 'counts': x['count']}
        all.append(obj)
    arr = {}
    arr['data'] = all
    client.close()
    return _response(arr, is_encoded)

def getall(request, shopid):
    is_encoded = False
    r = dict(JSON_RES)
    date = []
    value = []
    client = oclient()
    arr = {}
    db = client.ProjectReport_StarterDIY
    for cc in COLLECTION:
        date = []
        value = []
        col = db[cc]

        key = ['CalDate']
        condition = {}
        initial = {'count': 0 }
        reduce = 'function(doc, out) { out.count++; }'
        rr = col.group(key, condition, initial, reduce)

        for x in rr:
            date.append(str(x['CalDate'])[0:10])
            value.append(x['count'])

        cols = {'date': date, 'value':value}
        arr[cc] = cols
    client.close()
    return _response(arr, is_encoded)

def getloginfos(request, shopid, date):
    is_encoded = False
    r = dict(JSON_RES)
    client = oclient()
    arr = {}
    data = []
    tls = gettasklist(shopid,date)

    d2 = datetime.datetime.strptime(date, '%Y%m%d')
    d3 = d2 + datetime.timedelta(days=1)
    
    db = client.ProjectLogHistory_Athena
    col = db['ETLHistory']

    for name in tls:
        n = 0
        alltime = 0
        allsuccess = 0
        allfailed = 0

        docs = col.find({'TaskID':name, 'Src':{'$regex':shopid },'CreateTime':{'$gt':d2 }, 'CreateTime':{'$lt':d3 }})
        for x in docs:
            n += 1
            start = datetime.datetime.strptime(x['StartTime'], '%Y-%m-%dT%H:%M:%S')
            s = time.mktime(start.timetuple())
            end = datetime.datetime.strptime(x['EndTime'], '%Y-%m-%dT%H:%M:%S')
            e = time.mktime(end.timetuple())
            delta = e - s
            alltime += delta
            allsuccess += x['CountSuccess']
            allfailed += x['CountFailed']
        obj = {
            'task': name,
            'avgtimes':alltime / n,
            'success':allsuccess,
            'failed':allfailed,
            'create':str(x['CreateTime'])
        }
        data.append(obj)
        arr['data'] = data
    return _response(arr, is_encoded)

def gettasklist(shopid, date):
    is_encoded = False
    r = dict(JSON_RES)
    client = oclient()
    arr = {}
    data = []
    d2 = datetime.datetime.strptime(date, '%Y%m%d')
    d3 = d2 + datetime.timedelta(days=1)
    db = client.ProjectLogHistory_Athena
    col = db['ETLHistory']
    taskls = col.find({'Src':{'$regex':shopid },'CreateTime':{'$gt':d2 }, 'CreateTime':{'$lt':d3 }}).distinct('TaskID')
    return taskls

def getclients(request):
    is_encoded = False
    r = dict(JSON_RES)
    client = oclient()
    arr = {}
    db = client['ProjectTaskLog']
    ls = db.collection_names()
    collection = []
    if ls:
        for x in ls:
            if x != 'system.indexes':
                collection.append(x)
    arr['clients'] = collection
    return _response(arr, is_encoded)
