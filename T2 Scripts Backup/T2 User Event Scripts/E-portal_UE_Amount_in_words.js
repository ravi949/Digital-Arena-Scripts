/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/runtime'],

		function(search,record,runtime) {

	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(scriptContext) {
          try{
            var currency = scriptContext.newRecord.getValue('currency');
            
            if(currency){
			var customrecord_advanced_currencySearchObj = search.create({
				type: "customrecord_advanced_currency",
				filters:
					[
						["custrecord_adv_currency_currencylist","anyof",currency]
						],
						columns:
							[search.createColumn({name: "custrecord_decimal_precision", label: "Decimal Precision"}),
								search.createColumn({name: "custrecord_sub_unit_name", label: "Sub Unit Name"})
								]
			});
			var searchResultCount = customrecord_advanced_currencySearchObj.runPaged().count;
			log.debug("customrecord_advanced_currencySearchObj result count",searchResultCount);					

			customrecord_advanced_currencySearchObj.run().each(function(result){                      
				var decimalText = result.getValue('custrecord_sub_unit_name');
				var decimalPrecision = result.getValue('custrecord_decimal_precision');
				log.debug('decimalText',decimalText);
				log.debug('decimalPrecision',decimalPrecision);
				scriptContext.newRecord.setValue('custbody_currency_decimal_text',decimalText);
				scriptContext.newRecord.setValue('custbody_currency_decimal_precision',decimalPrecision);
			});
            }
          }catch(ex){
            log.error(ex.name,ex.message);
          }
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext) {
		var currency = scriptContext.newRecord.getValue('currency');
      if(currency){
        var customrecord_advanced_currencySearchObj = search.create({
				type: "customrecord_advanced_currency",
				filters:
					[
						["custrecord_adv_currency_currencylist","anyof",currency]
						],
						columns:
							[search.createColumn({name: "custrecord_decimal_precision", label: "Decimal Precision"}),
								search.createColumn({name: "custrecord_sub_unit_name", label: "Sub Unit Name"})
								]
			});
			var searchResultCount = customrecord_advanced_currencySearchObj.runPaged().count;
			log.debug("customrecord_advanced_currencySearchObj result count",searchResultCount);					

			customrecord_advanced_currencySearchObj.run().each(function(result){                      
				var decimalText = result.getValue('custrecord_sub_unit_name');
				var decimalPrecision = result.getValue('custrecord_decimal_precision');
				log.debug('decimalText',decimalText);
				log.debug('decimalPrecision',decimalPrecision);
				scriptContext.newRecord.setValue('custbody_currency_decimal_text',decimalText);
				scriptContext.newRecord.setValue('custbody_currency_decimal_precision',decimalPrecision);
			});

      }
			
	}

	function convertNumberToWords(s) {
		 var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
            var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            s = s.toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s)) return 'not a number';
            var x = s.indexOf('.');
            if (x == -1)
                x = s.length;
            if (x > 15)
                return 'too big';
            var n = s.split('');
            var str = '';
            var sk = 0;
            for (var i = 0; i < x; i++) {
                if ((x - i) % 3 == 2) {
                    if (n[i] == '1') {
                        str += tn[Number(n[i + 1])] + ' ';
                        i++;
                        sk = 1;
                    } else if (n[i] != 0) {
                        str += tw[n[i] - 2] + ' ';
                        sk = 1;
                    }
                } else if (n[i] != 0) { // 0235
                    str += dg[n[i]] + ' ';
                    if ((x - i) % 3 == 0) str += 'hundred ';
                    sk = 1;
                }
                if ((x - i) % 3 == 1) {
                    if (sk)
                        str += th[(x - i - 1) / 3] + ' ';
                    sk = 0;
                }
            }
            if (x != s.length) {
                var y = s.length;
                str += 'point ';
                for (var i = x + 1; i < y; i++)
                    str += dg[n[i]] + ' ';
            }
            return str.replace(/\s+/g, ' ');
	}


	function withDecimal(n) {
		var nums = n.toString().split('.')
		var whole = convertNumberToWords(nums[0])
		if (nums.length == 2) {
			var fraction = convertNumberToWords(nums[1])
			return whole + 'and ' + fraction;
		} else {
			return whole;
		}
	}


	function inWords (num) {

		var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
		var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

		if ((num = num.toString()).length > 9) return 'overflow';
		n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
		if (!n) return; var str = '';
		str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
		str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
		str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
		str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
		str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
		return str;
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {
try{
            var scriptObj = runtime.getCurrentScript();
			log.debug("Deployment Id: " + scriptObj.deploymentId);
            log.debug('recordID',scriptContext);
   			var objRec = record.load({type:scriptContext.newRecord.type,id:scriptContext.newRecord.id})
  			var amount = objRec.getText('total');
			log.debug('amount',amount);
			var currency  = objRec.getText('currency');
			var decimalText = objRec.getValue('custbody_currency_decimal_text');
            var decimalPrecision = objRec.getValue('custbody_currency_decimal_precision');
			  if(scriptObj.deploymentId == "customdeploy_da_ue_amount_in_words" || scriptObj.deploymentId == "customdeploy_da_ue_amount_inwords"){
                var amount = objRec.getText('payment');
			log.debug('amount',amount);
              }
            var recordType = scriptContext.newRecord.type;
  log.debug('dfoisdjv');
  if(scriptObj.deploymentId == "customdeploy_je_deploy"){
              //recordType = 'journalentry';
              var journalentrySearchObj = search.create({
                   type: "journalentry",
                   filters:
                   [
                      ["type","anyof","Journal"],
                      "AND", 
                      ["mainline","is","T"], 
                      "AND", 
                      ["internalid","anyof",scriptContext.newRecord.id]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "debitamount",
                         summary: "SUM",
                         label: "Amount (Debit)"
                      })
                   ]
                });
                var searchResultCount = journalentrySearchObj.runPaged().count;
                journalentrySearchObj.run().each(function(result){
                 amount = result.getValue({
                        'name':'debitamount',
                        summary:search.Summary.SUM

                	});
               // log.debug("journalentrySearchObj result count",amount);
                 //  return true;
                });
            }
           
			log.debug('amount',amount);
 amount = Number(amount.replace(/[^0-9.-]+/g,""));
          var exchangeRate = scriptContext.newRecord.getValue('exchangerate');
  	log.debug('exchangeRate',exchangeRate);
          var amount1 = (Number(amount))/(Number(exchangeRate));
  log.debug('amount1',amount1);
            amount1 =  amount1.toFixed(2);
  log.debug('amount1',amount1);
            var amountInwords = withDecimal(amount1);
			log.debug('amountInwords',amountInwords);
			var nums = amount1.toString().split('.');
			var whole = convertNumberToWords(nums[0]);
           log.debug('nums[0]',nums[0].length);
       if( nums[0].length != 0){
			if (nums[0] != "0") {
               if(decimalPrecision == 3){
                 nums[1] = nums[1]+"0";
               }
				var fraction = convertNumberToWords(nums[1]);
              log.debug('length',nums[1].length);
              if(nums[1].length == 2){
                log.debug('length',2);
                 if(nums[1] != "00"){
                   var id = record.submitFields({
                            type: recordType,
                            id: scriptContext.newRecord.id,
                            values: {
                                'custbody_amount_in_words':  whole +' '+currency+' and ' + fraction +''+decimalText +' only'
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
                //scriptContext.newRecord.setValue('custbody_amount_in_words', whole +' '+currency+' and ' + fraction +''+decimalText +' only');
              }else{
                
                 var id = record.submitFields({
                            type: recordType,
                            id: scriptContext.newRecord.id,
                            values: {
                                'custbody_amount_in_words':  whole +" "+currency +" only."
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
                //scriptContext.newRecord.setValue('custbody_amount_in_words',whole +" "+currency +" only.");
              }
              }
              
              if(nums[1].length == 3){
                log.debug('length',3);
                 if(nums[1] != "000"){
                   
                   var id = record.submitFields({
                            type: recordType,
                            id: scriptContext.newRecord.id,
                            values: {
                                'custbody_amount_in_words':   whole +' '+currency+' and ' + fraction +''+decimalText +' only'
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
               // scriptContext.newRecord.setValue('custbody_amount_in_words', whole +' '+currency+' and ' + fraction +''+decimalText +' only');
              }else{
                log.debug('dff',recordType);
                var id = record.submitFields({
                            type: recordType,
                            id: scriptContext.newRecord.id,
                            values: {
                                'custbody_amount_in_words':  whole +" "+currency +" only."
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
               // scriptContext.newRecord.setValue('custbody_amount_in_words',whole +" "+currency +" only.");
              }
              }
             				
				// return whole + 'and ' + fraction;
			} }else{
              if(decimalPrecision == 3){
                 nums[1] = nums[1]+"0";
               }
              var fraction = convertNumberToWords(nums[1]);
              
              var id = record.submitFields({
                            type:recordType,
                            id: scriptContext.newRecord.id,
                            values: {
                                'custbody_amount_in_words': fraction +" "+decimalText +" only."
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
				//scriptContext.newRecord.setValue('custbody_amount_in_words',fraction +" "+decimalText +" only.");
			}

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
