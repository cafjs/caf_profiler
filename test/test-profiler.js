// Modifications copyright 2020 Caf.js Labs and contributors
/*!
 Copyright 2013 Hewlett-Packard Development Company, L.P.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

var profiler = require('../index').plug;

process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception: " + err);
    console.log(err.stack);
    //console.log(myUtils.errToPrettyStr(err));
    process.exit(1);

});

module.exports = {
    helloworld: async function (test) {
        test.expect(4);
        const [err, prof] = await profiler.newInstance({_: {$: {} }}, {
            "module": "caf_profiler#plug", "name": "profiler", "env" : {}
        });
        console.log(err);
        test.ok(!err);
        var f = function(i, start) {
            if (i < 50) {
                if (start) {
                    prof.msgEnd(start);
                    f(i+1, null);
                } else {
                    start = prof.msgBegin();
                    setTimeout(function() {
                        f(i, start);
                    }, 100);
                }
            } else {
                var report = prof.report();
                var rep = report.node_unknown;
                test.equals(rep.requests.count, 50);
                test.equals(rep.pending.count, 0);
                console.log(JSON.stringify(report));
                test.ok(rep.stats.duration.sum > 50*100*1000);
                test.done();
            }
        };
        f(0, null);
    }
};
