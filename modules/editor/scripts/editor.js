/*
* Editor Communication Proxy
* Copyright (C) Codexa Organization 2013.
*/

'use strict'

// Closure to isolate code from tampering by scripts in document
var mainClosure = function() {
	// document to be edited
	var doc;
	
	// WARNING: DO NOT REPLACE, THIS STRING IS REPLACED WITH THE ORIGIN AUTOMATICALLY WHEN LOADED FROM editorProxy.js
	var mainOrigin = "[ORIGIN_OF_MAIN_DOCUMENT]";
	
	// Overide popups
	window.alert = null;
	window.confirm = null;
	window.prompt = null;
	
	// Proxy for communication with parent page
	var parentMessageProxy = new MessageProxy();
	parentMessageProxy.setSend(parent);
	parentMessageProxy.setRecv(window);

	parentMessageProxy.registerMessageHandler(function(e){
		if(e.origin !== mainOrigin) {
			throw new Error("origin did not match");
		}
		
		// initialize modules/register handlers
		// night mode
		initNight(doc, parentMessageProxy);
		
		var content_styles = document.querySelectorAll('link[data-for-content]');
		
		var content_scripts = document.querySelectorAll('script[data-for-content]');
		
		initDocIO(document, parentMessageProxy, function loadCallback(filetype, odtdoc) {
			window.mainOrigin = mainOrigin;
			window.parentMessageProxy = parentMessageProxy;
			window.initNight = initNight;
			window.filetype = filetype;
			window.odtdoc = odtdoc;
			
			// Content styles
			[].forEach.call(content_styles, function(content_style) {
				content_style.setAttribute('_firetext_remove', '');
				content_style.setAttribute('type', 'text/css');
				document.head.appendChild(document.adoptNode(content_style));
			});
			
			// Content scripts
			[].forEach.call(content_scripts, function(content_script) {
				window.eval(content_script.textContent);
			});
			
			delete window.mainOrigin;
			delete window.parentMessageProxy;
			delete window.initNight;
			delete window.filetype;
			delete window.odtdoc;
		});
		
		// success
		parentMessageProxy.postMessage({command: "init-success"});
	}, "init");
}
mainClosure();
mainClosure = undefined;
