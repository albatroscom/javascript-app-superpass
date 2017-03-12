

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
function SendPost(completeurl, postParam)
{
	var httpreq = new XMLHttpRequest();
	httpreq.open("POST", completeurl, true);

	httpreq.setRequestHeader("Content-Type","application/json");
	//httpreq.setRequestHeader("Cache-Control","no-cache, must-revalidate");
	//httpreq.setRequestHeader("Pragma","no-cache");
	httpreq.setRequestHeader("Connection","keep-alive");

	httpreq.onreadystatechange = reciveData;
	httpreq.send(postParam);
}

function SendGet(completeurl)
{
	var httpreq = new XMLHttpRequest();
	httpreq.open("GET", completeurl, true);

	httpreq.setRequestHeader("Content-Type","application/json");
	//httpreq.setRequestHeader("Cache-Control","no-cache, must-revalidate");
	//httpreq.setRequestHeader("Pragma","no-cache");
		   
	httpreq.onreadystatechange = reciveData;
	httpreq.send();
}


function reciveData(data)
{
	var httpreq = data.currentTarget;
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
								setTimeout(eventCheck, 1500);
								//timerIDs[timerIDs.length] = setInterval("eventCheck()", 3000);
								break;
							}
							default:
							{
								var statusLog = document.getElementById('statusLog');
								statusLog.innerHTML = "<span>" + httpRspData.ErrMsg +"[" + httpRspData.ErrCode +"]</span>" ;
								end(1);
								alert("서버 접속 오류 입니다.");
							}
						}
						break;
					}
					case 1102:		//EVENTPC_RSP
					{
						if(httpRspData.ErrCode == 0 || httpRspData.ErrCode == 1)
						{
							setTimeout(eventCheck, 1500);
						}
						else
						{
							var loop = true;
							switch(httpRspData.ErrCode)
							{
								case 8:
								{
									loop = false;
									end(1);
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
											end(1);
											alert("휴대폰 접속이 종료 되었습니다.");
										}
									}
									break;
								}
								
								
							}
							if(loop == true)
									setTimeout(eventCheck, 1500);
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
							setTimeout(eventCheck, 1000);
						}
						break;
					}
					case 1004:	//INFORM_ACCOUNTINFO_RSP
					{
						if(httpRspData.ErrCode == 0)
						{
							phoneConnect = false;
							parent.postMessage( "messageType=2&id="+httpRspData.ID+"&pwd="+httpRspData.PWD,callParent);
							//alert(httpRspData.PWD);
							//dispStatus(3);
							end(1);
						}
						break;
					}
				}
				
			}
		}
//		else
	//	{
	//		//parent.postMessage( "messageType=4",callParent);
		//	end();
			//alert("서버 접속이 종료 되었습니다. 잠시 후 이용하세요.");
			//
			
		//}
		
	}
} 

function eventCheck()
{
	var completeurl = serverURL + "EventCheck/WEBHTML/" + sessionItem.SessionID;
	SendGet(completeurl);
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
		
	var completeurl = serverURL + "SendConnectPC/WEBHTML";
	var postParam = JSON.stringify(obj);
	
	SendPost(completeurl, postParam);
}

function end(type) 
{
	
	
	document.getElementById('NumberTitle').innerHTML = "보안번호를 휴대폰에 입력 하세요.";
	if( type > 0)
	{
	
		var completeurl = serverURL + "Close/WEBHTML/" + sessionItem.SessionID;
		SendGet(completeurl);
	}
	
	for(i=0;i<timerIDs.length;i++)
	{
		clearInterval(timerIDs[i]);
	}
	
	dispStatus(0);
	parent.postMessage( "messageType=1",callParent);
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
			callParent = event.origin;
			hostname = QueryString["hostname"];
			callFURL = QueryString["furl"];
			title = QueryString["title"];
			if( title.length > 24)
				title = title.substr(0, 24) + "...";

			//alert(callParent + "/favicon.ico");
			//alert( document.location.host );
			nindex = hostname.indexOf(".");
			hostname = hostname.substr(nindex+1, hostname.length);
			//alert("http://www.google.com/s2/favicons?domain=" + hostname);
			document.getElementById('faviconImg').src= "https://www.google.com/s2/favicons?domain=" + hostname ;
			document.getElementById('domainURL').innerHTML= title;
			
			

			parent.postMessage( "messageType=3&frameHeight="+210,callParent);

			break;
		}
	}
}