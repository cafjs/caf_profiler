# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Profiler Library

[![Build Status](https://github.com/cafjs/caf_profiler/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_profiler/actions/workflows/push.yml)

Library to profile the performance of your app.

It measures latency, throughput, and queue length for CA requests.

For an app called `root-helloworld` access performance data with:

```
    curl https://root-helloworld.cafjs.com/stats
```

and an example reply is:

```
    {"node_10_5_123_118:1000":
         {"requests":{"type":"counter","count":32},
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
```

where:

* *requests* Number of of messages received.
* *pending* Number of requests queued.
* *duration* Latency time (in microseconds) to process your requests. See the `metrics` package for details.
* *rate* Number of requests processed per second. Averages over a moving window (1min, 5min, 15 min) using exponential decay.  See the `metrics` package for details.

## Configuration Example

### framework.json

 See {@link module:caf_profiler/plug_profiler}


### ca.json

  None
