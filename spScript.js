//V01.00.00.01
if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ?     this.getUTCFullYear()   + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

            throw new SyntaxError('JSON.parse');
        };
    }


    if (!Object.prototype.toJSONString) {
        Object.prototype.toJSONString = function (filter) {
            return JSON.stringify(this, filter);
        };
        Object.prototype.parseJSON = function (filter) {
            return JSON.parse(this, filter);
        };
    }
}());

/*
	messageType = 0 도메인 전송
	messageType = 1 취소
	messageType	= 2 로그인 정보 전송
	messageType = 3 DIV Height 전송
	messageType = 4 오류로 인한 종료
*/

//var serverURL = "http://smartlogin.infovine.co.kr/EasyLoginService/";
var serverURL = "http://192.168.30.5:1234/EasyLoginService/";
var seID = null;
var timerIDs = new Array();
var sessionItem = new Object();
var title = "";
var phoneConnect = false;
var autologin = true;

var idCount = 0;
var pwdCount = 0;
var ieVersion = -1;

	function getXMLHttpRequest() 
	{
	var xmlhttp = null;
		if (window.XDomainRequest) xmlhttp = new XDomainRequest();
		else if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
		else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		return xmlhttp;

	}
	function getInternetExplorerVersion() {
		var IEIndex = navigator.appVersion.indexOf("MSIE");         // MSIE를 찾고 인덱스를 리턴
		var IE8Over = navigator.userAgent.indexOf("Trident");      // MS IE 8이상 버전 체크

		 var strVer = -1;

		  if( IEIndex > 0 || IE8Over > 0 )  {
		   var trident = navigator.userAgent.match(/Trident\/(\d.\d)/i);
		   if (trident != null){
			switch (trident[1]) {
			 case "7.0" :
			  strVer = 11;
			  break;
			 case "6.0" :
			  strVer = 10;
			  break;
			 case "5.0" :
			  strVer = 9;
			  break;      
			 case "4.0" :
			  strVer = 8;
			  break;
			 default :
			  break;
			}
		   }    
		   
		   
		  }  else  {   
		   
		  }


	  return strVer;
	} 

	function checkVersion() {
	  var ver = getInternetExplorerVersion();
	  if (ver > -1)
	   msg = ver;
	  else
	   msg = "You are not using Internet Explorer";
	  return ver;
	}


function SendPost(completeurl, postParam)
{
	var httpreq = getXMLHttpRequest();
	httpreq.open("POST", completeurl, true);

	//httpreq.setRequestHeader("Content-Type","application/json");
	//httpreq.setRequestHeader("Cache-Control","no-cache, must-revalidate");
	//httpreq.setRequestHeader("Pragma","no-cache");
	//httpreq.setRequestHeader("Connection","keep-alive");

	if(checkVersion() > 9)
	{
		httpreq.onreadystatechange = reciveData;
	}
	else
	{
		httpreq.onreadystatechange = function() {
			reciveData(httpreq);
		}
	}
	
	
	httpreq.send(postParam);
}

function SendGet(completeurl)
{
	var httpreq = getXMLHttpRequest();
	httpreq.open("GET", completeurl, true);

	//httpreq.setRequestHeader("Content-Type","application/json");
	//httpreq.setRequestHeader("Cache-Control","no-cache, must-revalidate");
	//httpreq.setRequestHeader("Pragma","no-cache");
		   
	//httpreq.onreadystatechange = reciveData(httpreq);
	
	if(checkVersion() > 9)
	{
		httpreq.onreadystatechange = reciveData;
	}
	else
	{
		httpreq.onreadystatechange = function() {
			reciveData(httpreq);
		}
	}
	

	httpreq.send();
}


function reciveData(data)
{
	var httpreq = null;
	
	if(ieVersion > 9)
		httpreq = data.currentTarget;
	else
		httpreq = data;
	
	
	if(httpreq.readyState == 4 ) {
		if(httpreq.status == 200)
		{
			/*
			SENDCONNECT_PC_REQ = 1001,
            SENDCONNECT_PC_RSP = 1002,
            INFORM_ACCOUNTINFO_RSP = 1004,
            EVENTPC_RSP = 1102,

            CHANNEL_SECURE_REQ = 0001,
            CHANNEL_SECURE_RSP = 2000,

            // 서버단에서 바이패스 하기때문에 꺼꾸로 씀
            VERIFY_RANDNUM_PASS_PC_REQ = 2002,
            VERIFY_RANDNUM_PASS_PC_RSP = 2001,

            SHARE_SESSION_KEY_PASS_PC_REQ = 2004,
            SHARE_SESSION_KEY_PASS_PC_RSP = 2003,
			*/
			var httpRspData = null;
			if(httpreq.responseText.length > 0)
			{
				httpRspData = JSON.parse(httpreq.responseText);
				switch(httpRspData.CommandType)
				{
					case 1002:		//SENDCONNECT_PC_RSP
					{
						switch(httpRspData.ErrCode)
						{
							case 11:
							case 52:
							case 51:
							{
								var statusLog = document.getElementById('statusLog');
								statusLog.innerHTML = "<span>" + httpRspData.ErrMsg +"[" + httpRspData.ErrCode +"]</span>" ;
								
								sessionItem.SessionID = httpRspData.SessionID;
								setTimeout(eventCheck, 500);
								//timerIDs[timerIDs.length] = setInterval("eventCheck()", 3000);
								break;
							}
							default:
							{
								var statusLog = document.getElementById('statusLog');
								statusLog.innerHTML = "<span>" + httpRspData.ErrMsg +"[" + httpRspData.ErrCode +"]</span>" ;
								end();
								alert("서버 접속 오류 입니다.");
							}
						}
						break;
					}
					case 1102:		//EVENTPC_RSP
					{
						if(httpRspData.ErrCode == 0 || httpRspData.ErrCode == 1)
						{
							setTimeout(eventCheck, 500);
						}
						else
						{
							var loop = true;
							switch(httpRspData.ErrCode)
							{
								case 8:
								{
									loop = false;
									end();
									//alert("서버 접속이 종료 되었습니다.");
									break;
								}
								case 2000:
								case 1000:
								{
									document.getElementById('randomNumTxt').innerHTML = "<center><font style='color:#000000;font-size:13px;font-weight:normal'>휴대폰에서 로그인하기 클릭하세요.</FONT></center>"  ;
									document.getElementById('NumberTitle').innerHTML = "";
									break;
								}
								case 1001:
								{
									break;
								}
								case 2001:
								{
									break;
								}
								case 6004:		//이벤트가 없음.
								{
								//alert("asdf");
									break;
								}
								default:
								{
									var statusLog = document.getElementById('statusLog');
									statusLog.innerHTML = "<span>" + httpRspData.ErrMsg +"[" + httpRspData.ErrCode +"]</span>" ;
									
									
									if(httpRspData.ErrCode == 51)
									{
										phoneConnect = true;
										setTimeout(eventCheck, 10);
									}
									else if(httpRspData.ErrCode == 52)
									{
										if(phoneConnect == true)
										{
											loop = false;
											end();
											alert("휴대폰 접속이 종료 되었습니다.");
										}
									}
									break;
								}
							}
							if(loop == true)
								setTimeout(eventCheck, 500);
						}
						break;
					}
					case 3013://MAKE_RANDONUM_PASS_RSP
					{
						if(httpRspData.ErrCode == 6005)
						{
							var statusLog = document.getElementById('statusLog');
							statusLog.innerHTML = "<span>" + httpRspData.ErrMsg +"[" + httpRspData.ErrCode +"]</span>" ;
							dispStatus(2);
							
							//randomNumTxt = document.getElementById('randomNumTxt');
							//randomNumTxt.innerHTML = "<center><font style='color:#000000;font-size:22px;font-weight:bold'>" + httpRspData.RandomNum.substr(0,3) +" " +  httpRspData.RandomNum.substr(3,5) + "</FONT></center>" ;
							setTimeout(eventCheck, 500);
						}
						break;
					}
					case 1004:	//INFORM_ACCOUNTINFO_RSP
					{
						if(httpRspData.ErrCode == 0)
						{
							phoneConnect = false;
							//alert(document.getElementById('autologin').checked);
							if(autologin == true && document.getElementById('autologin').checked == true)
							{
								parent.postMessage( "messageType=2&id="+httpRspData.ID+"&pwd="+httpRspData.PWD,callParent);
								end();
							}
							else
							{
								document.getElementById('transData1').value = httpRspData.ID;
								document.getElementById('transData2').value = httpRspData.PWD;
								dispStatus(3);
							}
							
						}
						break;
					}
				}
				
			}
		}
		
	}
} 

function eventCheck()
{
	var completeurl = serverURL + "EventCheck/WEBHTML/" + sessionItem.SessionID;
	
	SendGet(completeurl);
	
}

function manualData()
{
	parent.postMessage( "messageType=4&transferData1="+document.getElementById('transData1').value+"&transferData2="+document.getElementById('transData2').value,callParent);
	end();
}

function LogWrite(strLog)
{
	document.getElementById('titleName').innerHTML = document.getElementById('titleName').innerHTML + "<BR>"+strLog;
}


function connectPH(telco, phno, pcode)
{
	var obj = new Object();
	obj.Telecom = telco;
	obj.PhoneNum = phno;
	obj.URL = callFURL;
	obj.Title = title;
	obj.Version = "1001";
	
	if(idCount > 3 && pwdCount == 2)
	{
		obj.Type = "02";
		//alert("회원가입 페이지 입니다.");
		}
	else
	{
		obj.Type = "01";
		//alert("로그인 페이지 입니다.");
		}
		
	var completeurl = serverURL + "SendConnectPC/WEBHTML";
	var postParam = JSON.stringify(obj);
	
	SendPost(completeurl, postParam);
}

function end() 
{
	
	document.getElementById('NumberTitle').innerHTML = "보안번호를 휴대폰에 입력 하세요.";
	for(i=0;i<timerIDs.length;i++)
	{
		clearInterval(timerIDs[i]);
	}
	
	var completeurl = serverURL + "Close/WEBHTML/" + sessionItem.SessionID;
	SendGet(completeurl);

	dispStatus(0);
	try{
		parent.postMessage( "messageType=1",callParent);
	}catch(e)
	{
	}
	

}

function getDataParser(postData) 
{
	var s1 = postData.substring(0, postData.length).split('&'),
		r = {}, s2, i;
	for (i = 0; i < s1.length; i += 1) {
		s2 = s1[i].split('=');
		r[decodeURIComponent(s2[0])] = decodeURIComponent(s2[1]);
	}
	return r;
}

function EasyLoginChildlistener(event)
{
	var QueryString = getDataParser(event.data);
	switch(QueryString["messageType"])
	{
		case "0":
		{
			ieVersion = checkVersion();
			callParent = event.origin;
			hostname = QueryString["hostname"];
			callFURL = QueryString["furl"];
			title = QueryString["title"];
			idCount = parseInt(QueryString["idCount"]);
			pwdCount = parseInt(QueryString["pwdCount"]);
			
			//alert(idCount);
			
			if( title.length > 24)
				title = title.substr(0, 24) + "...";

			if( parseInt(QueryString["autologincheck"]) > 1 )
			{
				document.getElementById('autologin').checked = false;
				document.getElementById('autologin').disabled = true;
				autologin = false;
			}
				

			nindex = hostname.indexOf(".");
			hostname = hostname.substr(nindex+1, hostname.length);
			//autologincheck
			document.getElementById('faviconImg').src= "https://www.google.com/s2/favicons?domain=" + hostname ;
			document.getElementById('domainURL').innerHTML= title;
			
			

			parent.postMessage( "messageType=3&frameHeight="+210,callParent);

			break;
		}
		case "1":
		{
			end() ;
		}
	}
}