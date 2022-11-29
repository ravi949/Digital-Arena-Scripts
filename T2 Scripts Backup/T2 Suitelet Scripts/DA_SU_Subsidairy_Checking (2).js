/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/runtime'],
		/**
		 * @param {search} search
		 */
		function(runtime) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try{
			if(context.request.method == 'GET'){
				log.debug('params',context.request.parameters);

				var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);
				context.response.write(JSON.stringify({success : true, subsidairiesExists : featureEnabled }));
			}
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	return {
		onRequest: onRequest
	};

});
