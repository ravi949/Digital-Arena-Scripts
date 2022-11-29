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
			var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_CUSTOMER_REFUND"
			});
          log.debug('template',myTemplate);
			var objRec = record.load({
				type : 'customerrefund',
				id :params.id
			});
          log.debug('objRec', objRec);
          var total = objRec.getValue('total');
          log.debug('total',total);
          var appliedAmt = objRec.getValue('applied');
          log.debug('appliedAmt',appliedAmt);
          var originalAmt = objRec.getSublistValue('apply','total',0);
          log.debug('originalAmt',originalAmt);
          var myArray=[];
          var totalAmt = 0;
          var registeredFee = 0;
          var feesA = 0;
          var feesB = 0;
          var feesC = 0;
          var feesD = 0;
          var count = 0;
          var paymentScheduleSearch = search.create({
                    type: 'customrecord_da_amm_payment_schedule_',
                    columns: [
                        'custrecord_da_amm_payment_sche_date', 'custrecord_da_amm_payment_sche_amt'
                    ],
                    filters: ['custrecord_da_amm_tran_ref_no', 'anyof', params.id]
                });
                log.debug('paymentScheduleSearch count', paymentScheduleSearch.runPaged().count);
                paymentScheduleSearch.run().each(function(result) {
                    var dueDate = result.getValue('custrecord_da_amm_payment_sche_date');
                    log.debug('dueDate',dueDate);
                    var paymentSchedAmt = result.getValue('custrecord_da_amm_payment_sche_amt');
                    log.debug('paymentSchedAmt',paymentSchedAmt);
                    totalAmt = parseFloat(totalAmt) + parseFloat(paymentSchedAmt);
                    totalAmt = totalAmt.toFixed(3);
                    count = parseFloat(count) + 1;
                    myArray.push({'dueDate':dueDate,'paymentSchedAmt':paymentSchedAmt,'count':count});
                    return true;
                });
                registeredFee = parseFloat(registeredFee) + (parseFloat(originalAmt) *(10/100));
                registeredFee = registeredFee.toFixed(3);
                log.debug('registeredFee',registeredFee);
                feesA = parseFloat(feesA) + parseFloat(registeredFee);
                feesA = feesA.toFixed(3);
                log.debug('feesA',feesA);
                feesB = parseFloat(feesB) + (parseFloat(appliedAmt) - parseFloat(registeredFee)) * (0.95);
                feesB = feesB.toFixed(3);
                log.debug('feesB',feesB);
                feesC = parseFloat(feesC) + (parseFloat(appliedAmt) - parseFloat(registeredFee)) * (0.85);
                feesC = feesC.toFixed(3);
                log.debug('feesC',feesC);
                feesD = parseFloat(feesD) + (parseFloat(appliedAmt) - parseFloat(registeredFee)) * (0.50);
                feesD = feesD.toFixed(3);
                log.debug('feesD',feesD);
				var obj = {originalAmt:originalAmt,registeredFee:registeredFee,feesA:feesA,feesB:feesB,feesC:feesC,feesD:feesD};
          		log.debug('obj',obj);
				var myArrayObj = {
          			'myArray' : myArray
          		}
          log.debug('myArray',myArray);
          myTemplate.addCustomDataSource({
				format : render.DataSource.OBJECT,
				alias : "objj",
				data : myArrayObj
			});
          myTemplate.addCustomDataSource({
              	format: render.DataSource.OBJECT,
             	alias: "obj",
             	data:obj
            });
          myTemplate.addRecord('record', objRec);
			var template = myTemplate.renderAsPdf();
			log.debug('template', template);
			context.response.writeFile(template, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});
