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
			// Vendor Bill Payment
			if(params.type == 'vendorpayment'){
				var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_BILL_PAYMENT_TEMPLATE"
			});
          log.debug('template',myTemplate);
          var objRec = record.load({
				type : 'vendorpayment',
				id :params.id
			});
          log.debug('objRec', objRec);
          var transactionSearchObj = search.create({
        type: 'TRANSACTION',
        filters: ['internalid', 'anyof', params.id],
        columns: [
        		search.createColumn({
	                name: "account",
	                label: "Account"
	            }),
	            search.createColumn({
	                name: "currency",
	                label: "Currency"
	            }),
	            search.createColumn({
	                name: "debitamount",
	                label: "Debit Amount"
	            }),
	            search.createColumn({
	                name: "creditamount",
	                label: "Credit Amount"
	            })
	            ]
    });
        var myArray = [];
        var totDebitAmt = 0;
        var totCreditAmt = 0;
          		var searchResultCount = transactionSearchObj.runPaged().count;
	            log.debug("transactionSearchObj result count", searchResultCount);
	            transactionSearchObj.run().each(function(result) {
	                var account = result.getText('account');
	                log.debug('account', account);
	                account = account.replace('&', '&amp;'); 
          			log.debug('account',account);
	                var currency = result.getText('currency');
	                log.debug('currency', currency);
	                var debitAmt = result.getValue('debitamount');
	                log.debug('debitAmt', debitAmt);
	                var creditAmt = result.getValue('creditamount');
	                log.debug('creditAmt', creditAmt);
	                if(debitAmt){
	                	totDebitAmt = parseFloat(totDebitAmt) + parseFloat(debitAmt);
	                log.debug('totDebitAmt',totDebitAmt);
	                }
	                if(creditAmt){
	                totCreditAmt = parseFloat(totCreditAmt) + parseFloat(creditAmt);
	                log.debug('totCreditAmt',totCreditAmt);
	                }
	                myArray.push({'account':account,'currency':currency,'debitAmt':debitAmt,'creditAmt':creditAmt});
	                return true;
	            });
	            var obj = {totDebitAmt:totDebitAmt, totCreditAmt:totCreditAmt};
          log.debug('obj',obj);
	    var myArrayObj = {
          	'myArray' : myArray
        }
        log.debug('myArrayObj',myArrayObj);

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
			}
			// Vendor PrePayment
			if(params.type == 'vendorprepayment'){
				var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_VENDOR_PREPAYMENT"
			});
          log.debug('template',myTemplate);
          var objRec = record.load({
				type : 'vendorprepayment',
				id :params.id
			});
          log.debug('objRec', objRec);
          var transactionSearchObj = search.create({
        type: 'TRANSACTION',
        filters: ['internalid', 'anyof', params.id],
        columns: [
        		search.createColumn({
	                name: "account",
	                label: "Account"
	            }),
	            search.createColumn({
	                name: "currency",
	                label: "Currency"
	            }),
	            search.createColumn({
	                name: "debitamount",
	                label: "Debit Amount"
	            }),
	            search.createColumn({
	                name: "creditamount",
	                label: "Credit Amount"
	            })
	            ]
    });
        var myArray = [];
        var totDebitAmt = 0;
        var totCreditAmt = 0;
          		var searchResultCount = transactionSearchObj.runPaged().count;
	            log.debug("transactionSearchObj result count", searchResultCount);
	            transactionSearchObj.run().each(function(result) {
	                var account = result.getText('account');
	                log.debug('account', account);
	                account = account.replace('&', '&amp;'); 
          			log.debug('account',account);
	                var currency = result.getText('currency');
	                log.debug('currency', currency);
	                var debitAmt = result.getValue('debitamount');
	                log.debug('debitAmt', debitAmt);
	                var creditAmt = result.getValue('creditamount');
	                log.debug('creditAmt', creditAmt);
	                if(debitAmt){
	                	totDebitAmt = parseFloat(totDebitAmt) + parseFloat(debitAmt);
	                log.debug('totDebitAmt',totDebitAmt);
	                }
	                if(creditAmt){
	                totCreditAmt = parseFloat(totCreditAmt) + parseFloat(creditAmt);
	                log.debug('totCreditAmt',totCreditAmt);
	                }
	                myArray.push({'account':account,'debitAmt':debitAmt,'creditAmt':creditAmt});
	                return true;
	            });
	            var obj = {totDebitAmt:totDebitAmt, totCreditAmt:totCreditAmt};
          log.debug('obj',obj);
	    var myArrayObj = {
          	'myArray' : myArray
        }
        log.debug('myArrayObj',myArrayObj);

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
			}
			// Vendor Bill
			if(params.type == 'vendorbill'){
				var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_VENDOR_BILL_PRINT"
			});
          log.debug('template',myTemplate);
          var objRec = record.load({
				type : 'vendorbill',
				id :params.id
			});
          log.debug('objRec', objRec);
          var transactionSearchObj = search.create({
        type: 'TRANSACTION',
        filters: ['internalid', 'anyof', params.id],
        columns: [
        		search.createColumn({
	                name: "account",
	                label: "Account"
	            }),
	            search.createColumn({
	                name: "currency",
	                label: "Currency"
	            }),
	            search.createColumn({
	                name: "debitamount",
	                label: "Debit Amount"
	            }),
	            search.createColumn({
	                name: "creditamount",
	                label: "Credit Amount"
	            }),
	            search.createColumn({
	                name: "exchangerate",
	                label: "Exchange Rate"
	            }),
	            search.createColumn({
	                name: "item",
	                label: "Item"
	            }),
	            search.createColumn({
	                name: "purchasedescription",
	                join: "item",
	                label: "Description"
	            })
	            ]
    });
        var myArray = [];
        var totDebitAmt = 0;
        var totCreditAmt = 0;
        var totDebitAmount = 0;
        var totCreditAmount = 0;
        var totDebAmt = 0;
        var totCredAmt = 0;
          		var searchResultCount = transactionSearchObj.runPaged().count;
	            log.debug("transactionSearchObj result count", searchResultCount);
	            transactionSearchObj.run().each(function(result) {
	                var account = result.getText('account');
	                log.debug('account', account);
	                account = account.replace('&', '&amp;'); 
          			log.debug('account',account);
	                var currency = result.getText('currency');
	                log.debug('currency', currency);
	                var debitAmt = result.getValue('debitamount');
	                log.debug('debitAmt', debitAmt);
	                var creditAmt = result.getValue('creditamount');
	                log.debug('creditAmt', creditAmt);
	                var exchangeRate = result.getValue('exchangerate');
	                log.debug('exchangeRate', exchangeRate);
	                var itemCode = result.getText('item');
	                log.debug('itemCode', itemCode);
	                var itemDescription = result.getValue({
	                	name: 'purchasedescription',
	                	join: 'item'
	                });
	                log.debug('itemDescription1', itemDescription);
	                itemDescription = itemDescription.replace('&', '&amp;'); 
          			log.debug('itemDescription2',itemDescription);
	                if(!exchangeRate){
	                	if(debitAmt){
	                	totDebAmt = parseFloat(totDebAmt) + parseFloat(debitAmt);
	                log.debug('totDebAmt',totDebAmt);
	                }
	                if(creditAmt){
	                totCredAmt = parseFloat(totCredAmt) + parseFloat(creditAmt);
	                log.debug('totCredAmt',totCredAmt);
	                }
	            }
	                if(exchangeRate > 0){
	                	if(debitAmt){
	                		totDebitAmt = parseFloat(debitAmt) * parseFloat(exchangeRate);
	                		totDebitAmt = totDebitAmt.toFixed(2);
	                        log.debug('totalDebitAmt',totDebitAmt);
	                		totDebitAmount = parseFloat(totDebitAmount) + parseFloat(totDebitAmt);
	                		log.debug('totDebitAmount',totDebitAmount);
	                }
	                if(creditAmt){
	                		totCreditAmt = parseFloat(creditAmt) * parseFloat(exchangeRate);
	                		totCreditAmt = totCreditAmt.toFixed(2);
	                		log.debug('totalCreditAmt',totCreditAmt);
	                		totCreditAmount = parseFloat(totCreditAmount) + parseFloat(totCreditAmt);
	                		log.debug('totCreditAmount',totCreditAmount);
	                }
	                }
	                myArray.push({'account':account,'currency':currency,'debitAmt':debitAmt,'creditAmt':creditAmt,'exchangeRate':exchangeRate, 'totDebitAmt':totDebitAmt, 'totCreditAmt':totCreditAmt, 'itemCode':itemCode, 'itemDescription':itemDescription});
	                totDebitAmt = 0;
	                totCreditAmt = 0;
	                return true;
	            });
	            var obj = {totDebAmt:totDebAmt, totCredAmt:totCredAmt, totDebitAmount:totDebitAmount, totCreditAmount:totCreditAmount};
          log.debug('obj',obj);
	    var myArrayObj = {
          	'myArray' : myArray
        }
        log.debug('myArrayObj',myArrayObj);

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
			}

			// Bill Credit
			if(params.type == 'vendorcredit'){
				var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_BILL_CREDIT_TEMP"
			});
          log.debug('template',myTemplate);
          var objRec = record.load({
				type : 'vendorcredit',
				id :params.id
			});
          log.debug('objRec', objRec);
          var transactionSearchObj = search.create({
        type: 'TRANSACTION',
        filters: ['internalid', 'anyof', params.id],
        columns: [
        		search.createColumn({
	                name: "account",
	                label: "Account"
	            }),
	            search.createColumn({
	                name: "currency",
	                label: "Currency"
	            }),
	            search.createColumn({
	                name: "debitamount",
	                label: "Debit Amount"
	            }),
	            search.createColumn({
	                name: "creditamount",
	                label: "Credit Amount"
	            }),
	            search.createColumn({
	                name: "exchangerate",
	                label: "Exchange Rate"
	            }),
	            search.createColumn({
	                name: "item",
	                label: "Item"
	            }),
	            search.createColumn({
	                name: "purchasedescription",
	                join: "item",
	                label: "Description"
	            })
	            ]
    });
        var myArray = [];
        var totDebitAmt = 0;
        var totCreditAmt = 0;
        var totDebitAmount = 0;
        var totCreditAmount = 0;
        var totDebAmt = 0;
        var totCredAmt = 0;
          		var searchResultCount = transactionSearchObj.runPaged().count;
	            log.debug("transactionSearchObj result count", searchResultCount);
	            transactionSearchObj.run().each(function(result) {
	                var account = result.getText('account');
	                log.debug('account', account);
	                account = account.replace('&', '&amp;'); 
          			log.debug('account',account);
	                var currency = result.getText('currency');
	                log.debug('currency', currency);
	                var debitAmt = result.getValue('debitamount');
	                log.debug('debitAmt', debitAmt);
	                var creditAmt = result.getValue('creditamount');
	                log.debug('creditAmt', creditAmt);
	                var exchangeRate = result.getValue('exchangerate');
	                log.debug('exchangeRate', exchangeRate);
	                var itemCode = result.getText('item');
	                log.debug('itemCode', itemCode);
	                var itemDescription = result.getValue({
	                	name: 'purchasedescription',
	                	join: 'item'
	                });
	                log.debug('itemDescription1', itemDescription);
	                itemDescription = itemDescription.replace('&', '&amp;'); 
          			log.debug('itemDescription2',itemDescription);
	                if(!exchangeRate){
	                	if(debitAmt){
	                	totDebAmt = parseFloat(totDebAmt) + parseFloat(debitAmt);
	                log.debug('totDebAmt',totDebAmt);
	                }
	                if(creditAmt){
	                totCredAmt = parseFloat(totCredAmt) + parseFloat(creditAmt);
	                log.debug('totCredAmt',totCredAmt);
	                }
	            }
	                if(exchangeRate > 0){
	                	if(debitAmt){
	                		totDebitAmt = parseFloat(debitAmt) * parseFloat(exchangeRate);
	                		totDebitAmt = totDebitAmt.toFixed(2);
	                        log.debug('totalDebitAmt',totDebitAmt);
	                		totDebitAmount = parseFloat(totDebitAmount) + parseFloat(totDebitAmt);
	                		log.debug('totDebitAmount',totDebitAmount);
	                }
	                if(creditAmt){
	                		totCreditAmt = parseFloat(creditAmt) * parseFloat(exchangeRate);
	                		totCreditAmt = totCreditAmt.toFixed(2);
	                		log.debug('totalCreditAmt',totCreditAmt);
	                		totCreditAmount = parseFloat(totCreditAmount) + parseFloat(totCreditAmt);
	                		log.debug('totCreditAmount',totCreditAmount);
	                }
	                }
	                myArray.push({'account':account,'currency':currency,'debitAmt':debitAmt,'creditAmt':creditAmt,'exchangeRate':exchangeRate, 'totDebitAmt':totDebitAmt, 'totCreditAmt':totCreditAmt, 'itemCode':itemCode, 'itemDescription':itemDescription});
	                totDebitAmt = 0;
	                totCreditAmt = 0;
	                return true;
	            });
	            var obj = {totDebAmt:totDebAmt, totCredAmt:totCredAmt, totDebitAmount:totDebitAmount, totCreditAmount:totCreditAmount};
          log.debug('obj',obj);
	    var myArrayObj = {
          	'myArray' : myArray
        }
        log.debug('myArrayObj',myArrayObj);

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
			}

			
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});