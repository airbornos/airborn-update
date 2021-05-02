var core_version=3,settings={},inTransaction=!1,transaction=null,transactionDate,transactionIdPrefix,filesToPut;window.startTransaction=function(){inTransaction=!0;transaction||(transaction={},transactionDate=new Date,transactionIdPrefix=Math.round(Math.random()*Date.now()).toString(16),filesToPut=0)};
window.endTransaction=function(){console.log(inTransaction,filesToPut,transaction);if(transaction&&(inTransaction=!1,!filesToPut)){var a=transaction;transaction=null;var b={},c=Object.keys(a);c.forEach(function(c){var d=transactionIdPrefix+(a[c][1].S3Prefix?":"+a[c][1].S3Prefix:"")+(a[c][1].transactionId?":"+a[c][1].transactionId:"");a[c][1].fullTransactionId=d;b[d]||(b[d]=0);b[d]++});Object.keys(b).forEach(function(a){if(1<b[a]){var c=new XMLHttpRequest;c.open("POST","/transaction/add");c.setRequestHeader("Content-Type",
"application/json");c.send(JSON.stringify({transactionId:a,messageCount:b[a]}))}});var d=0,f=c.length;(function h(){for(var e=0,k={path:void 0,callback:void 0};d<f;k={path:k.path,callback:k.callback},d++)if(k.path=c[d],a[k.path][1].finishingTransaction=!0,a[k.path][1].messageCount=b[a[k.path][1].fullTransactionId],/\/\.history\//.test(a[k.path][0])&&(window.getFileCache[a[k.path][0]]={codec:a[k.path][1].codec,contents:a[k.path][2],ts:Date.now()}),k.callback=a[k.path][4],a[k.path][4]=function(b){return function(c){c&&
403===c.status&&!a[b.path][1].S3Prefix?(setTimeout(function(b){return function(){putFile.apply(window,a[b.path])}}(b),5E3),relogin()):(c||50!==++e||h(),b.callback.apply(this,arguments))}}(k),putFile.apply(window,a[k.path]),0===(d+1)%50){d++;break}})()}};
var sjcl=parent.sjcl,pako=parent.pako,private_key=parent.private_key,private_hmac=parent.private_hmac,files_hmac=parent.files_hmac,password=parent.password,files_key=parent.files_key,account_info=parent.account_info,S3Prefix=parent.S3Prefix,arrayBuffer_fromBits=sjcl.codec.arrayBuffer.fromBits;sjcl.codec.arrayBuffer.fromBits=function(a,b){return arrayBuffer_fromBits(a,!!b)};var codec={};codec.raw=codec.arrayBuffer={fromAB:function(a){return a},toAB:function(a){return a}};
window.TextDecoder||(window.TextDecoder=function(){},TextDecoder.prototype.decode=function(a){return sjcl.codec.utf8String.fromBits(sjcl.codec.arrayBuffer.toBits(a.buffer))});window.TextEncoder||(window.TextEncoder=function(){},TextEncoder.prototype.encode=function(a){return{buffer:sjcl.codec.arrayBuffer.fromBits(sjcl.codec.utf8String.toBits(a))}});var decoder=new TextDecoder("utf8"),encoder=new TextEncoder("utf8");codec.utf8String={fromAB:function(a){return decoder.decode(new DataView(a))},toAB:function(a){return encoder.encode(a).buffer}};
codec.json={toAB:function(a){return codec.utf8String.toAB(JSON.stringify(a))}};codec.prettyjson={toAB:function(a){return codec.utf8String.toAB(JSON.stringify(a,null,"\t"))}};codec.json.fromAB=codec.prettyjson.fromAB=function(a){return JSON.parse(codec.utf8String.fromAB(a))};var currentFilename;codec.dir=codec.yaml={fromAB:function(a){return jsyaml.safeLoad(codec.utf8String.fromAB(a),{filename:currentFilename})},toAB:function(a){return codec.utf8String.toAB(jsyaml.safeDump(a,{flowLevel:1}))}};
codec.dir.fromAB=function(a){a=codec.utf8String.fromAB(a);if("{}"!==a&&!/^.+: {.*}$/m.test(a)){var b={};a.split("\n").forEach(function(a){a&&(b[a]={})});return b}return jsyaml.safeLoad(a,{filename:currentFilename})};codec.base64={fromAB:function(a){a=new Uint8Array(a);for(var b=a.byteLength,c=Array(b),d=0;d<b;d++)c[d]=String.fromCharCode(a[d]);return btoa(c.join(""))},toAB:function(a){a=atob(a);for(var b=a.length,c=new Uint8Array(b),d=0;d<b;d++)c[d]=a.charCodeAt(d);return c.buffer}};
var subtle=window.crypto.subtle||window.crypto.webkitSubtle,subtleKeys={};
function encrypt(a,b,c,d){function f(){c.adata=c.adata?sjcl.codec.arrayBuffer.toBits(codec.json.toAB(c.adata)):[];d(sjcl.encrypt(a,sjcl.codec.arrayBuffer.toBits(b),c))}try{subtleKeys[a]||(subtleKeys[a]=subtle.importKey("raw",sjcl.codec.arrayBuffer.fromBits(a),{name:"AES-CTR"},!1,["encrypt","decrypt"])),subtleKeys[a].then(function(d){var e=sjcl.codec.arrayBuffer.fromBits(sjcl.random.randomWords(4,0)),k=b.byteLength,f=_computeL(k,e.byteLength),l=new Uint8Array(16);l[0]=f-1;l.set(new Uint8Array(e,0,
15-f),1);var g=codec.json.toAB(c.adata),k=_computeTag(a,b,e,g,64,k,f);return Promise.all([subtle.encrypt({name:"AES-CTR",counter:l,length:128},d,sjcl.codec.arrayBuffer.fromBits(k)),subtle.encrypt({name:"AES-CTR",counter:(l[15]=1,l),length:128},d,b)]).then(function(a){var b=a[0];a=a[1];var d=new Uint8Array(a.byteLength+b.byteLength);d.set(new Uint8Array(a),0);d.set(new Uint8Array(b),a.byteLength);return JSON.stringify({adata:codec.base64.fromAB(g),cipher:"aes",ct:codec.base64.fromAB(d),iter:null!=
c.iter?c.iter:1E3,salt:c.salt,iv:codec.base64.fromAB(e),ks:128,ts:64,v:1})})}).then(d,f)}catch(g){f(g)}}
function decrypt(a,b,c,d){function f(f){var e,k;try{e=sjcl.decrypt(a,b,{raw:1},c)}catch(g){k=f}k?d(null,k):(c.adata=c.adata.length?codec.json.fromAB(sjcl.codec.arrayBuffer.fromBits(c.adata)):void 0,d(sjcl.codec.arrayBuffer.fromBits(e)))}try{subtleKeys[a]||(subtleKeys[a]=subtle.importKey("raw",sjcl.codec.arrayBuffer.fromBits(a),{name:"AES-CTR"},!1,["encrypt","decrypt"])),subtleKeys[a].then(function(d){var e=JSON.parse(b),k=codec.base64.toAB(e.ct),f=codec.base64.toAB(e.iv),l=e.ts,g=k.byteLength-l/8,
p=_computeL(g,f.byteLength),n=new Uint8Array(16);n[0]=p-1;n.set(new Uint8Array(f,0,15-p),1);var q=e.ks,t=codec.base64.toAB(e.adata);return Promise.all([subtle.decrypt({name:"AES-CTR",counter:n,length:q},d,new DataView(k,g)),subtle.decrypt({name:"AES-CTR",counter:(n[15]=1,n),length:q},d,new DataView(k,0,g))]).then(function(b){function d(){e.adata&&(c.adata=codec.json.fromAB(codec.base64.toAB(e.adata)));return h}var k=sjcl.codec.arrayBuffer.toBits(b[0]),h=b[1];b=_computeTag(a,h,f,t,l,g,p);if(sjcl.bitArray.equal(k,
b)||0===g%16&&(b=new Uint8Array(g+16),b.set(new Uint8Array(h),0),b=_computeTag(a,b.buffer,f,t,l,g,p),sjcl.bitArray.equal(k,b)))return d();throw new sjcl.exception.corrupt("ccm: tag doesn't match");})}).then(d,f)}catch(g){f(g)}}function _computeL(a,b){var c;for(c=2;4>c&&a>>>8*c;c++);c<15-b&&(c=15-b);return c}
function _computeTag(a,b,c,d,f,g,h){var e=sjcl.arrayBuffer.ccm.r;if(0!==g%16){var k=new Uint8Array(g+(16-g%16));k.set(new Uint8Array(b),0);b=k.buffer}return e(new sjcl.cipher.aes(a),b,sjcl.codec.arrayBuffer.toBits(c.slice(0,15-h)),sjcl.codec.arrayBuffer.toBits(d),f/8,g,h)}window.getFileCache={};window.getRequestCache={};
window.getFile=function(a,b,c){function d(){if(!1!==b.cache){var d=window.getFileCache[a];if(d){if((b.codec||"utf8String")===(d.codec||"utf8String"))c(d.contents);else{currentFilename=a;var e;try{e=codec[b.codec||"utf8String"].fromAB(codec[d.codec||"utf8String"].toAB(d.contents))}catch(f){return c(null,{status:0,statusText:f.message}),!0}c(e)}return!0}}}function f(){if(4===e.readyState&&(window.getRequestCache[a]=null,!d()))if(200===e.status){currentFilename=a;var f={};(new Promise(function(a,c){g?
a(e.response):decrypt(null!=b.password?b.password:files_key,e.response,f,function(b,d){d?decrypt(password,e.response,f,function(b,e){e?c(d):a(b)}):a(b)})})).then(function(a){return f.adata&&f.adata.gz?f.adata.rel?new Promise(function(b,c){getFile(f.adata.rel,{rawObjectLocation:!0,codec:"arrayBuffer"},function(d,e){e?c(e):b(pako.inflate(new Uint8Array(a),{dictionary:_getRelativeDictionary(d)}).buffer)})}):pako.ungzip(new Uint8Array(a)).buffer:a}).then(function(d){d=codec[b.codec||"utf8String"].fromAB(d);
!1!==b.cache&&(window.getFileCache[a]={codec:b.codec,contents:d,ts:Date.now()});c(d)}).catch(function(a){c(null,a.status?a:{status:0,statusText:a.message})})}else 403!==e.status||b.S3Prefix?(console.error("GET",a),c(null,{status:e.status,statusText:e.statusText})):relogin(function(){getFile(a,b,c)})}if("function"===typeof b||void 0===b)c=b,b={};void 0===c&&(c=function(){});var g=a.startsWith("/Core/")||a.startsWith("/Apps/firetext/")||a.startsWith("/Apps/strut/");if(b.S3Prefix&&b.S3Prefix!==window.S3Prefix||
b.object)b.cache=!1;if(!d()){var h=window.getRequestCache[a],e;h?(e=h,f()):(e=window.getRequestCache[a]=new XMLHttpRequest,console.log("GET",a));e.addEventListener("readystatechange",f);h||(e.open("GET",g?"/v2/live"+a:getObjectUrl("GET",a,b)),g&&(e.responseType="arraybuffer"),b.S3Prefix&&e.setRequestHeader("X-S3Prefix",b.S3Prefix),e.send(null))}};var relogging=!1;
function relogin(a){if(relogging)a&&setTimeout(a,100);else{var b=JSON.parse(localStorage.creds||sessionStorage.creds||"{}");window.login&&b&&b.username===window.username?(relogging=!0,window.login(b,null,function(){},function(){relogging=!1;a&&a()},function(){window.location.reload()})):window.location.reload()}}var fileChangeListeners=[];window.listenForFileChanges=function(a,b){fileChangeListeners.push({path:a,fn:b})};
function notifyFileChange(a,b){fileChangeListeners.forEach(function(c){startsWith(c.path,a)&&c.fn(a,b)})}function getObjectUrl(a,b,c){return c.rawObjectLocation?"/object/"+b:"/object/"+(c.object||_getObjectLocation(b))+("PUT"===a?"?":"")+"#"+(c.S3Prefix&&c.S3Prefix!==S3Prefix&&!c.demo?"1":"0")+"."+b}function _getObjectLocation(a){var b=startsWith("/key",a)||startsWith("/hmac",a);return sjcl.codec.hex.fromBits((b?private_hmac:files_hmac).mac(a))}
function _getUploadHistory(a){return 5<=account_info.tier&&startsWith("/Documents/",a)}window.getObjectLocation=function(a,b){var c=_getUploadHistory(a);b({S3Prefix:S3Prefix,object:_getObjectLocation(a),demo:"/demo"===location.pathname?!0:void 0,hist:c?!0:void 0})};window.guid=function(){return([1E7]+-1E3+-4E3+-8E3+-1E11).replace(/[018]/g,function(a){return(a^window.crypto.getRandomValues(new Uint8Array(1))[0]&15>>a/4).toString(16)})};
function extend(a){[].slice.call(arguments,1).forEach(function(b){Object.keys(b).forEach(function(c){var d=b[c];null!=d&&d.constructor===Object?a.hasOwnProperty(c)?extend(a[c],d):a[c]=d:void 0===d?delete a[c]:a[c]=d})});return a}
function deepEquals(a,b){if(b==a)return!0;for(var c in a)if("undefined"==typeof b[c])return!1;for(c in a)if(a[c])switch(typeof a[c]){case "object":if(!deepEquals(a[c],b[c]))return!1;break;default:if(a[c]!==b[c])return!1}else if(b[c])return!1;for(c in b)if("undefined"==typeof a[c])return!1;return!0}function debounce(a,b,c){c.timeout&&clearTimeout(c.timeout);c.timeout=setTimeout(function(){delete c.timeout;a()},b)}var debounceObj={};
window.putFile=function(a,b,c,d,f,g){b.finishingTransaction||(startTransaction(),debounce(endTransaction,100,debounceObj));if("function"===typeof c||void 0===c)g=d,f=c,c=b,b={},d={};else if("function"===typeof d||void 0===d)b&&"object"===typeof b?(g=f,f=d,d={}):c&&"object"===typeof c&&(g=f,f=d,d=c,c=b,b={});f||(f=function(){});var h=_getUploadHistory(a),e=d.edited||transactionDate||new Date,k,m;if(!(b.finishingTransaction||"/"===a||b.S3Prefix&&b.S3Prefix!==window.S3Prefix)){var l=a.lastIndexOf("/",
a.length-2)+1,r=a.substr(0,l),p=a.substr(l);filesToPut++;getFile(r,{codec:"dir"},function(a){a||(a={});k="/"===p.substr(-1)?void 0:codec[b.codec||"utf8String"].toAB(c).byteLength;m=!a.hasOwnProperty(p);var f=extend({},m?{created:e}:a[p],{edited:h?e:void 0,size:h?k:void 0},d);a.hasOwnProperty(p)&&deepEquals(f,a[p])||(a=extend({},a),a[p]=f,putFile(r,{codec:"dir",transactionId:b.transactionId},a,{edited:h?e:void 0}));filesToPut--;!transaction||inTransaction||filesToPut||window.endTransaction()})}if(b.S3Prefix&&
b.S3Prefix!==window.S3Prefix||b.object)b.cache=!1;/\/\.history\//.test(a)||!1!==b.cache&&(window.getFileCache[a]={codec:b.codec,contents:c,ts:Date.now()});/\.history\//.test(a)||!h||b.finishingTransaction||(filesToPut++,getFile(a+".history/",{codec:"dir"},function(d){d||m||(filesToPut++,getFile(a,{codec:"raw",cache:!1},function(c,d){d||putFile(a+".history/v0"+a.match(/(\/|\.\w+)?$/)[0],{codec:"raw",transactionId:b.transactionId},c,{created:void 0,edited:void 0});filesToPut--;!transaction||inTransaction||
filesToPut||window.endTransaction()}));var f=a+".history/v"+(d?Math.max.apply(Math,Object.keys(d).map(function(a){return parseInt(a.substr(1),10)}))+1:1)+a.match(/(\/|\.\w+)?$/)[0];putFile(f,{codec:b.codec,transactionId:b.transactionId,histprevname:d&&a+".history/"+Object.keys(d).pop()},c,{edited:e});filesToPut--;!transaction||inTransaction||filesToPut||window.endTransaction()}));if(b.finishingTransaction){console.log("PUT",a);c=codec[b.codec||"utf8String"].toAB(c);var n,q;b.histprevname&&(q=window.getFileCache[b.histprevname])&&
(l=codec[q.codec||"utf8String"].toAB(q.contents),l=pako.deflate(new Uint8Array(c),{dictionary:_getRelativeDictionary(l)}).buffer,l.byteLength*(q.chainLength+1||2)<(q.compressionRatio||1)*c.byteLength&&((window.getFileCache[a]||{}).compressionRatio=q.compressionRatio,(window.getFileCache[a]||{}).chainLength=(q.chainLength||0)+1,c=l,n={gz:1,rel:_getObjectLocation(b.histprevname)}));!1===b.compress||n||(l=pako.gzip(new Uint8Array(c)).buffer,l.byteLength<c.byteLength&&((window.getFileCache[a]||{}).compressionRatio=
l.byteLength/c.byteLength,c=l,n={gz:1}));encrypt(null!=b.password?b.password:startsWith("/key",a)||startsWith("/hmac",a)?private_key:files_key,c,extend({adata:n},null!=b.password?{iter:b.iter,salt:b.salt}:{}),function(c){c=new Blob([c],{type:"binary/octet-stream"});var d=new XMLHttpRequest;d.open("PUT",getObjectUrl("PUT",a,b)+"?");var e=b.fullTransactionId;1<b.messageCount&&d.setRequestHeader("X-Transaction-Id",e);b.ACL&&d.setRequestHeader("X-ACL",b.ACL);b.S3Prefix&&d.setRequestHeader("X-S3Prefix",
b.S3Prefix);b.objectAuthkey&&d.setRequestHeader("X-Object-Authentication",b.objectAuthkey);d.addEventListener("readystatechange",function(){4===this.readyState&&(200===this.status?(f(),notifyFileChange(a,m?"created":"modified")):(console.log("error",this),f({status:this.status,statusText:this.statusText})))});d.addEventListener("progress",function(a){a.lengthComputable&&g&&g(a.loaded,a.total)});d.send(c)})}else transaction[a]=[a,b,c,d,f,g]};
function _getRelativeDictionary(a){return new Uint8Array(a,0,Math.min(a.byteLength,32506))}var mimeTypes={js:"text/javascript",css:"text/css",png:"image/png",svg:"image/svg+xml",woff:"application/font-woff",html:"text/html",htm:"text/html",xhtml:"text/html"};function startsWith(a,b){return b.substr(0,a.length)===a}
function resolve(a,b,c){if(""===b)return a;if("/"===b[0])return resolve(c,b.substr(1),c);a=a.replace(/[^/]*$/,"")+b;for(b=/([^./]+\/\.\.\/|\/\.(?=\/))/g;b.test(a);)a=a.replace(b,"");startsWith(dirname(c),a)||(a=resolve(c,a.substr(a.lastIndexOf("/",a.length-2)+1),c));return a}function dirname(a){return a.substr(0,a.lastIndexOf("/")+1)}function basename(a){return a.substr(a.lastIndexOf("/")+1)}
function parallel(a,b){var c=a.length,d=Array(c),f;a.forEach(function(g,h){a[h](function(a,g){d[h]=a;f=g;--c||b.apply(this,d.concat(f))})})}function getTopLocation(a){var b=new URL(top.location);b.hash&&!0!==a&&(b.hash="#"+b.hash.slice(1).split(";").filter(function(b){return b.split(":")[0]===a}).map(function(b){return b.replace(a+":","")}).join(";"));return b.href}function isHTML(a){return"html"===a||"htm"===a||"xhtml"===a}
window.prepareFile=function(a,b,c,d,f){var g={};Object.keys(b).forEach(function(a){g[a]=b[a]});var h=a.substr(a.lastIndexOf(".")+1);isHTML(h)&&!1!==b.bootstrap?(g.bootstrap=!1,delete g.apikey,delete g.permissions,delete g.csp,h=+(Error().stack.match(/[:@](\d+)/)||[])[1]+2,h=['<!DOCTYPE html>\n<html>\n<head>\n\t<meta charset="utf-8">\n</head>\n<body>\n<script>\nif(window.parent !== window.top && window.matchMedia("only screen and (max-device-width: 640px)").matches) document.write("Loading\u2026");',
"document.rootParent = "+JSON.stringify(b.rootParent)+";","document.relativeParent = "+JSON.stringify(a)+";","document.filenames = {};","document.apikey = "+JSON.stringify(b.apikey||getAPIKey(b.permissions))+";","document.top_location = "+JSON.stringify(getTopLocation((b.permissions||{}).urlArgs))+";",'window.addEventListener("message", function(message) {\n\tif(message.data.action === "createObjectURL") {\n\t\tvar arg = message.data.args[0], object;\n\t\ttry {\n\t\t\tobject = new File([arg.data], arg.name, {type: arg.type});\n\t\t} catch(e) {\n\t\t\tobject = new Blob([arg.data], {type: arg.type});\n\t\t}\n\t\tvar url = URL.createObjectURL(object);\n\t\tdocument.filenames[url] = arg.name;\n\t\twindow.top.postMessage({inReplyTo: message.data.messageID, result: [url]}, "*");\n\t\treturn;\n\t}\n\tif(message.data.progress) {\n\t\twindow.parent.postMessage({action: "wm.setProgress", args: [message.data.result[0] / message.data.result[1]]}, "*");\n\t} else {\n\t\tdocument.open("text/html", "replace");\n\t\tdocument.write(message.data.result[0]);\n\t\tdocument.close();\n\t\twindow.parent.postMessage({action: "wm.hideProgress", args: []}, "*");\n\t}\n});',
'window.top.postMessage({action: "fs.prepareFile", args: '+JSON.stringify([a,g])+', apikey: document.apikey}, "*");','window.parent.postMessage({action: "wm.showProgress", args: []}, "*");\n\x3c/script>\n</body>\n</html>',"\x3c!--# sourceURL = /Core/modules/core/core.js > inline at line "+h+" --\x3e"].join("\n"),c(h)):isHTML(h)&&(!1!==b.compat||b.csp)?(g.compat=!1,delete g.csp,parallel([function(a){prepareString('\n<script src="/Core/modules/webapi/webapi.js">\x3c/script>\n',{rootParent:"/",compat:!1,
selfContained:b.selfContained},a,function(){},f)},function(b){prepareFile(a,g,b,d,f)},function(a){getFile(b.appData+"localStorage",function(b){a(b||"{}")})}],function(d,f,g,l){if(l)return c("");c(f.replace(/^\uFEFF/,"").replace(/(?=<script|<\/head|\x3c!--|$)/i,"<script>document.airborn_localStorage = "+g.replace(/<\/(script)/ig,"<\\/$1")+";"+(b.selfContained?["document.rootParent = "+JSON.stringify(b.rootParent)+";","document.relativeParent = "+JSON.stringify(a)+";","document.filenames = {};\ndocument.apikey = null;\ndocument.top_location = window.location;"].join("\n"):
"")+"\x3c/script>"+(b.csp?'<meta http-equiv="Content-Security-Policy" content="'+b.csp.replace(/"/g,"&quot;")+'">':"")+d))})):"js"===h?getFile(a,function(e,k){if(k)return c("");if(!1!==b.compat&&!b.webworker){var h={cookie:"airborn_cookie",location:"airborn_location",top:"airborn_top",parent:"airborn_parent"};navigator.userAgent.match(/Safari/)&&(h.localStorage="airborn_localStorage",h.src="airborn_src",h.href="airborn_href",h.pathname="airborn_pathname",h.source="airborn_source",h.contentWindow=
"airborn_contentWindow",navigator.userAgent.match(/Chrome/)||(h.indexedDB="airborn_indexedDB",h.responseType="airborn_responseType",h.readyState="airborn_readyState",h.status="airborn_status",h.response="airborn_response",h.responseText="airborn_responseText",h.innerHTML="airborn_innerHTML",h.result="airborn_result"));e=renameGlobalVariables(a,e,h)}b.webworker?(g.relativeParent=a,g.rootParent=a.match(/\/Apps\/.+?\//)[0],prepareString(e,g,c,d,f)):c(e)}):getFile(a,function(b,k){if(k)return c("");g.rootParent=
g.rootParent||a;g.relativeParent=a;delete g.bootstrap;delete g.compat;prepareString(b,g,c,d,f)})};
window.prepareString=function(a,b,c,d,f){function g(){if(d){var a=r,b=k.length;k.forEach(function(c){"progressDone"in c&&(a+=c.progressDone,b+=c.progressTotal)});d(a,b)}}var h=0,e,k=[],m,l=/^(?!airbornstorage)[a-z]+:/i,r=0;if(b.webworker)for(var p=/importScripts\s*\([\s\S]*?\)/;e=a.substr(h).match(p);){var n=0,q=e[0];m=/((["']))(.*?)(\2)()/;h+=e.index;for(e.pos=h;e=q.substr(n).match(m);)l.test(e[3])||k.push(e),n+=e.index,e.pos=h+n,n++;h++}else for(m=/((?:\s(?:src|(?:xlink:)?href|icon|data)\s*=|[:,\s]url\()\s*(["']?))(.*?)(?=["') >])(\2\s*\)?)/;e=
a.substr(h).match(m);)l.test(e[3])||k.push(e),h+=e.index,e.pos=h,h++;k.length?k.forEach(function(d){prepareUrl(d[3],b,function(b,e){e||(d[5]=b);r++;g();r===k.length&&(k.reverse().forEach(function(b){b[5]&&(a=a.substr(0,b.pos+b[1].length)+b[5]+a.substr(b.pos+b[0].length-b[4].length))}),c(a))},function(a,b){d.progressDone=a;d.progressTotal=b;g()},f)}):c(a)};var rArgs=/[?#].*$/,rHMAC=/([?&#])hmac=(\w+)&?/;
window.prepareUrl=function(a,b,c,d,f){function g(a,d){var g;d?c(null,d):b.selfContained||51<=(navigator.userAgent.match(/Firefox\/(\d+)/)||[])[1]||navigator.userAgent.match(/Safari/)&&!navigator.userAgent.match(/Chrome/)?(g="js"===k?","+encodeURIComponent(a+"\n//# sourceURL=")+e:"css"===k?","+encodeURIComponent(a+"\n/*# sourceURL="+e+" */"):isHTML(k)?","+encodeURIComponent(a+"\n\x3c!--# sourceURL="+e+" --\x3e"):"string"===typeof a?","+encodeURIComponent(a):";base64,"+codec.base64.fromAB(a),g="data:"+
mimeTypes[k]+";filename="+encodeURIComponent(e)+";charset=utf-8"+g,c(g.replace(/'/g,"%27"))):(g="js"===k?a+"\n//# sourceURL="+e:"css"===k?a+"\n/*# sourceURL="+e+" */":isHTML(k)?a+"\n\x3c!--# sourceURL="+e+" --\x3e":a,f({data:g,type:mimeTypes[k],name:e+h},c))}var h=(a.match(rArgs)||[""])[0];a=a.replace(rArgs,"");if(startsWith("//",a))c("https:"+a+h);else{"/"===a&&(a="");var e;if(startsWith("airbornstorage:",a)){if(_getObjectLocation(a)!==(h.match(rHMAC)||[])[2]){console.warn("Access denied: HMAC for airbornstorage: URL is incorrect:",
a+h);c(a+h);return}e=a.substr(15)}else e=resolve(b.relativeParent,a,b.rootParent);if(h&&e===b.relativeParent)c(h);else{var k=e.substr(e.lastIndexOf(".")+1),m={};Object.keys(b).forEach(function(a){m[a.replace(/^_/,"")]=b[a]});isHTML(k)||"css"===k||"js"===k||"svg"===k?prepareFile(e,m,g,d,f):getFile(e,{codec:"arrayBuffer"},g)}}};getFile("/Core/lib/yaml/js-yaml.js",eval);getFile("/Core/lib/cherow/cherow.js",eval);getFile("/Core/lib/estraverse/estraverse.js",eval);var mainWindow;
window.openWindow=function(a,b){prepareUrl(a,{__compat:!1,rootParent:"/Core/",appData:"/CoreData/",permissions:{urlArgs:!0}},function(a){var d=document.createElement("div");d.className="window";d.style.overflow="hidden";d.addEventListener("scroll",function(){d.scrollLeft=d.scrollTop=0});var f=document.createElement("iframe");f.sandbox="allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox";f.setAttribute("allowfullscreen","true");f.src=a;f.scrolling="no";f.name="LaskyaWM";
d.appendChild(f);document.body.appendChild(d);mainWindow=f.contentWindow;b(f)},function(){},function(a,b){var f;try{f=new File([a.data],a.name,{type:a.type})}catch(g){f=new Blob([a.data],{type:a.type})}b(URL.createObjectURL(f))})};window.setTitle=function(a){document.title=a?a+" - Airborn":"Airborn"};window.setIcon=function(){};
window.openWindowTop=function(a,b,c){window.open.apply(window,a);window.addEventListener("message",function(d){if("requestMessageChannel"===d.data.action){var f=window.open("",a[1]);d.source===f&&(d.stopImmediatePropagation(),d=new MessageChannel,f.postMessage({action:"setupMessageChannel",appName:b},"*",[d.port1]),c(d.port2))}})};var pushUrl,pushHandlers={};
function pushInit(){return new Promise(function(a){getFile("/Core/lib/socket.io/socket.io.js",function(b){function c(){Object.keys(pushHandlers).forEach(function(a){pushHandlers[a].forEach(function(a){a({event:"push-register"})})});pushHandlers={}}eval(b);b=io();var d;b.on("hello",function(b){d=(new URL(b,location.href)).href;a(d)});b.on("push",function(a){pushHandlers[a.registrationId]&&pushHandlers[a.registrationId].forEach(function(b){b({event:"push",result:{pushEndpoint:d+"?registrationId="+a.registrationId,
version:a.version}})})});b.on("reconnect",function(){pushUrl=new Promise(function(b){a=b});c()});b.on("reconnect_failed",function(){console.error("socket.io reconnect failed");pushUrl=null;c()})})})}window.pushRegister=function(a){pushUrl||(pushUrl=pushInit());pushUrl.then(function(b){var c=Math.round(Math.random()*Date.now()).toString(16);b=b+"?registrationId="+c;pushHandlers[c]||(pushHandlers[c]=[]);pushHandlers[c].push(a);a({event:"registered",result:b})})};
window.pushUnregister=function(a,b){delete pushHandlers[a.split("?registrationId=")[1]];b()};function corsReq(a,b,c){var d=new XMLHttpRequest;if("withCredentials"in d)d.open("GET",a,!0);else if("undefined"!==typeof XDomainRequest)d=new XDomainRequest,d.open("GET",a);else throw Error("CORS not supported.");d.onload=b;c&&(d.responseType=c);d.send()}function includeJSZip(a){getFile("/Core/lib/jszip/jszip.min.js",function(b){window.JSZip||window.eval(b);a&&a()})}
window.installPackage=function(a,b,c){"function"===typeof b&&(c=b,b={});includeJSZip();corsReq(a,function(){var d=JSON.parse(this.responseText);corsReq(d.package_path,function(){var f=this.response;includeJSZip(function(){var g=new JSZip(f),h=Object.keys(g.files),e=0,k=0,m="/Apps/"+basename(d.package_path).replace("-"+d.version,"").replace(".zip","")+"/";getFile(m,{codec:"dir"},function(c){putFile(m,{codec:"dir",transactionId:"packageinstall"},c||{},{x:{marketplace:extend({},b,{manifest_url:a})}})});
h.forEach(function(a){var b=g.files[a];b.options.dir||(k++,putFile(m+a,{codec:"arrayBuffer",transactionId:"packageinstall"},b.asArrayBuffer(),function(){e++;e===k&&c({installState:"installed"})}))})})},"arraybuffer")})};
window.update=function(){corsReq("/v2/current-id",function(){var a=this.response;getFile("/Core/version-id",function(b){a!==b&&(!(settings.core&&settings.core.notifyOfUpdates||10<=account_info.tier)||document.hasFocus()&&confirm("There is an update for Airborn. Do you want to install it now? You can continue using Aiborn while and after updating. The update will apply next time you open Airborn.\nIf you click Cancel, you will be asked again in 1 hour or next time you open Airborn."))&&(includeJSZip(),
corsReq("/v2/current",function(){var a=this.response;includeJSZip(function(){var b=new JSZip(a),f=Object.keys(b.files);window.showNotice("airbornupdating","Updating\u2026 Please don't close this tab.");f.forEach(function(a,c){var e=b.files[a];e.options.dir||putFile("/"+a,{codec:"arrayBuffer",transactionId:"airbornupdate"},e.asArrayBuffer(),c===f.length-1?function(){setTimeout(function(){window.hideNotice("airbornupdating")},1E4)}:void 0)})})},"arraybuffer"))})})};var notices;
window.showNotice=function(a,b,c){notices||(notices={},document.body.insertAdjacentHTML("beforeend",'<style>\n.airborn-notice {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 50%;\n\theight: var(--height);\n\tline-height: 25px;\n\tpointer-events: none;\n\tz-index: 999;\n\ttransform: translateX(-50%);\n\tmargin-right: -50%;\n\tpadding: 0 10px;\n\ttransition: opacity 1s;\n\tcolor: white;\n\ttext-shadow: 1px 1px 1px black;\n\tfont-weight: normal;\n}\n.airborn-notice:before {\n\tcontent: "";\n\tposition: absolute;\n\twidth: 100%;\n\theight: 100%;\n\tbackground: url(/images/logo-hanger.svg) no-repeat 0%/100% 100%;\n\ttop: -100%;\n\tz-index: -1;\n\ttransform: scaleX(2.2);\n\tfilter: drop-shadow(0px var(--height) rgba(154, 132, 0, 0.3));\n\tborder-bottom: transparent 1px solid; /* Force Chrome to render this offscreen element. */\n}\n.airborn-notice .close-button, .airborn-notice a {\n\tpointer-events: all;\n\tcolor: inherit;\n\tpadding: 10px;\n\tmargin: -10px;\n}\n.airborn-notice .close-button {\n\tcursor: pointer;\n\tfloat: right;\n}\n.airborn-notice a {\n\tmargin-right: 0;\n}\n@media only screen and (max-device-width: 640px) {\n\t.airborn-notice {\n\t\ttop: auto;\n\t\tbottom: 0;\n\t\twidth: 100%;\n\t\tcolor: inherit;\n\t\ttext-shadow: none;\n\t\tbackground: rgba(154, 132, 0, 0.3);\n\t}\n\t.airborn-notice:before {\n\t\tdisplay: none;\n\t}\n}\n</style>'));
notices[a]=document.createElement("div");notices[a].className="airborn-notice";notices[a].innerHTML=b;notices[a].style.opacity=0;c&&notices[a].insertAdjacentHTML("afterbegin",'<span class="close-button" onclick="window.hideNotice(\''+a+"')\">\u2716</span>");document.body.appendChild(notices[a]);notices[a].style.setProperty("--height",notices[a].offsetHeight+"px");b=new Image;b.src="/images/logo-hanger.svg";b.addEventListener("load",function(){notices[a].style.opacity=1})};
window.hideNotice=function(a){notices[a].style.opacity=0;notices[a].addEventListener("transitionend",function(){notices[a].remove();delete notices[a]})};window.getServerMessages=function(){var a=new XMLHttpRequest;a.open("GET","/messages");a.responseType="json";a.addEventListener("load",function(){200===this.status&&this.response.forEach(function(a){a.min_core_version&&a.min_core_version>core_version||a.max_core_version&&a.max_core_version<core_version||alert(a.text)})});a.send()};
window.loadSettings=function(){getFile("/settings",{codec:"json"},function(a){settings=a})};window.logout=function(){sessionStorage.clear();localStorage.clear();document.cookie=document.cookie.split("=")[0]+"=";window.location.reload()};var APIKeys=[];function getAPIKey(a){var b=new Uint32Array(10);window.crypto.getRandomValues(b);b=Array.prototype.slice.call(b).toString();APIKeys[b]=a||{};return b}window.isValidAPIKey=function(a){return void 0!==APIKeys[a]};
function givesAccessToPath(a,b,c){return(a[c||"read"]||[]).some(function(a){return startsWith(a,b)})}
window.hasPermission=function(a,b,c){a=APIKeys[a];switch(b){case "getFile":return givesAccessToPath(a,c[0]);case "putFile":return givesAccessToPath(a,c[0],"write");case "prepareFile":return givesAccessToPath(a,c[1].rootParent)&&givesAccessToPath(a,c[0])&&!Object.keys(c[1]).some(function(a){return"permissions"===a.replace(/^_+/,"")});case "prepareString":case "prepareUrl":return givesAccessToPath(a,c[1].rootParent)&&!Object.keys(c[1]).some(function(a){return"permissions"===a.replace(/^_+/,"")});case "startTransaction":case "endTransaction":return!1;
case "listenForFileChanges":return givesAccessToPath(a,c[0]);case "getObjectLocation":return givesAccessToPath(a,c[0].replace(/^airbornstorage:/,""))&&a.getObjectLocations;case "pushRegister":case "pushUnregister":case "openWindowTop":return!0;case "installPackage":return a.hasOwnProperty("manageApps");case "setTitle":case "setIcon":case "logout":return!1;default:return!1}};
function renameGlobalVariables(a,b,c){function d(a){return"FunctionDeclaration"===a.type||"FunctionExpression"===a.type||"Program"===a.type}if("undefined"===typeof cherow||"undefined"===typeof estraverse||"//# airbornos:prepared"===b.substr(-22))return b;var f=Object.keys(c).filter(function(a){return(new RegExp("(?:^|[^\"'])\\b"+a+"\\b")).test(b)});if(!f.length)return b;console.log("Parsing",a,"because it appears to contain the following variables:",f.join(", "));var g;void 0===window.parseTime&&
(window.parseTime=0);window.startTime=performance.now();try{g=cherow.parseScript(b,{ranges:!0})}catch(h){return console.log(h),b}window.parseTime+=performance.now()-window.startTime;console.log("parse "+a,performance.now()-window.startTime,"cumulative:",window.parseTime);var e=[],k=[],m=[];estraverse.traverse(g,{enter:function(a){d(a)&&("FunctionDeclaration"===a.type&&e[e.length-1].push(a.id.name),"FunctionDeclaration"===a.type||"FunctionExpression"===a.type?(e.push(a.params.map(function(a){return a.name})),
a.rest&&e[e.length-1].push(a.rest.name)):e.push([]));"VariableDeclarator"===a.type&&e[e.length-1].push(a.id.name);"Identifier"===a.type&&k.push(a);if("ObjectExpression"===a.type)return a.properties.forEach(function(a){a.key.isObjectKey=!0}),a;if("MemberExpression"===a.type&&!a.computed)return a.property.isProperty=!0,a},leave:function(a){if(d(a)){a=k;for(var b=0;b<a.length;b++){var f=a[b],g=f.name,h;if(!(h=f.isObjectKey||!c.hasOwnProperty(g))&&(h=!f.isProperty))a:{h=e;for(var t=0;t<h.length;t++)if(-1!==
h[t].indexOf(g)){h=!0;break a}h=!1}h||m.push(f)}e.pop();k=[]}}});m.sort(function(a,b){return a.start-b.start});a=[];for(g=f=0;g<m.length;g++)a.push(b.substring(f,m[g].start),c[m[g].name]),f=m[g].end;return a.join("")+b.substr(f)+"\n//# airbornos:prepared"};
