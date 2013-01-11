# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See http://www.cafjs.com 

## CAF Lib Properties

This repository contains a CAF lib to profile the performance of your app.
It measures latency, throughput and queue length for CA requests.


## API

Performance data is accessible using a browser, not programmatically from
within a CA method.

If your app is called `helloworld`  the url to access latency and throughput info (using GET) is:

    http://helloworld.cafjs.com/stats
    
and you get something like:

    {"ca_10_5_123_118":
         {"inReq":{"type":"counter","count":32},
          "outReq":{"type":"counter","count":32},
          "pending":{"type":"counter","count":0},
          "stats":{"type":"timer",
               "duration":{"type":"histogram","min":10.468857362866402,
                           "max":25.201154872775078,"sum":520.6768773496151,
                           "variance":10.983277433789388,
                           "mean":16.271152417175472,
                           "std_dev":3.3141028097796523,
                           "count":32,"median":15.921283978968859,
                           "p75":18.803593004122376,"p95":21.699812030419697,
                           "p99":25.201154872775078,"p999":25.201154872775078},
               "rate":{"type":"meter","count":32,"m1":2.9644e-320,
                       "m5":4.612237719003562e-216,
                       "m15":1.2479503887084598e-73,
                       "mean":0.00021508800984629893,"unit":"seconds"}
          }
         }
    }

where:

- *InReq* # of requests received by that node.js process.
- *OutReq* # of requests processed by that node.js process.
- *pending* # of queued requests.
- *duration* Latency time in msec to process your requests. See the *metrics* package for details.
- *rate* Number of requests processed per second. Averages over a moving window (1min, 5min, 15 min) using exponential decay.  See the *metrics* package for details.


To sample the number of pending messages, set `env.traceProfiler.interval` in framework.json  to the number of seconds between samples, and then:

    http://helloworld.cafjs.com/stats/startProfiling

and to finish profiling:

    http://helloworld.cafjs.com/stats/stopProfiling
    
that will display an array:

    [0,0,0,0,0,0,....]


## Configuration Example

### framework.json

     "plugs" : [
         {
             "module": "caf_profiler/plug",
             "name": "profiler",
             "description": "Performance profiling of CA requests\n Properties: <traceProfiler> {interval: <secs>}  enables queue length profiling\n",
             "env" : {
                 "traceProfiler": {
                    "interval" : 0.01                   
                 } 
              }
            }
          }
          ...
      ]
  

### ca.json

  None
    
        
            
 
