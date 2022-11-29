/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([ 'N/render', 'N/record', 'N/file', 'N/search', 'N/format' ],

function(render, record, file, search, format) {

	/**
	 * Definition of the Suitelet script trigger point.
	 * 
	 * @param {Object}
	 *            context
	 * @param {ServerRequest}
	 *            context.request - Encapsulation of the incoming request
	 * @param {ServerResponse}
	 *            context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
			var params = context.request.parameters;
			log.debug('params',params);
			var urlorigin = params.urlorigin;
      log.debug('urlorigin', urlorigin);
			var myTemplate1 = render.create();
			myTemplate1.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_JOBCARD_RECEIPT_VOUCHER"
			});
          //CUSTTMPL_172_5740514_SB1_236
          log.debug('template1',myTemplate1)
			var objRec = record.load({
				type : 'customrecord_da_job_cards',
				id :params.recordId
			});
          log.debug('objRec', objRec);
			myTemplate1.addRecord('record', objRec);

      var subsidiary = objRec.getValue('custrecord_da_jobcard_subsidiary');
      log.debug('subsidiary',subsidiary);
      var subsidiaryRec = record.load({
        type : 'subsidiary',
        id :subsidiary
      });
      var logo = subsidiaryRec.getValue('logo');
      log.debug('logo',logo);
       var image = file.load({
                        id: logo
                    });
       log.debug('imageUrl',image.url);
      
      var image1 = urlorigin+image.url;
       logourl = image1.split('&');
                log.debug('logourl', logourl);
          
          var logoObj ={
            "img_logo1": logourl[0],
            "img_logo2": logourl[1],
            "img_logo3": logourl[2]
          };
          log.debug('logoObj',logoObj);
           myTemplate1.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "logoObj ",
                    data:logoObj 
                });
            
			var template1 = myTemplate1.renderAsPdf();
			log.debug('template2', template1);
			context.response.writeFile(template1, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});