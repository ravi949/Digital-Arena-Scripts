/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/record', 'N/email','N/config'],
	function(runtime, record, email,config) {
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
			try {} catch (ex) {
				log.error(ex.name, ex.message);
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
		function beforeSubmit(scriptContext) {}
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
			try {

				var itemRecpRec = record.load({
					type:'itemreceipt',
					id: scriptContext.newRecord.id
				}); 
				var lineCount = itemRecpRec.getLineCount({
					sublistId: 'item'
				});
				var itemArr = [];
				for (var i = 0; i < lineCount; i++) {
					var inventoryDeatilExist = itemRecpRec.getSublistValue({
						sublistId: 'item',
						fieldId: 'inventorydetailavail',
						line: i
					});
					var itemText = itemRecpRec.getSublistValue({
						sublistId: 'item',
						fieldId: 'itemname',
						line: i
					});
					log.debug('inventoryDeatilExist', inventoryDeatilExist);
					if (inventoryDeatilExist) {
						var inventorydetailRecId = itemRecpRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'inventorydetail',
							line: i
						});
						var inventoryDeatilRec = record.load({
							type: 'inventorydetail',
							id: inventorydetailRecId
						});
						log.debug('inventoryDeatilRec', inventoryDeatilRec);
						var count = inventoryDeatilRec.getLineCount('inventoryassignment');
						for (var j = 0; j < count; j++) {
							var noOfDaysToExpire = inventoryDeatilRec.getSublistValue({
								sublistId: 'inventoryassignment',
								fieldId: 'custrecord_da_no_of_days_to_expire',
								line: j
							});
							log.debug('noOfDaysToExpire', noOfDaysToExpire);
							if (noOfDaysToExpire < 60) {
								var sNo = inventoryDeatilRec.getSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'receiptinventorynumber',
									line: j
								});
								//log.debug(sNo);
								var quantity = inventoryDeatilRec.getSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'quantity',
									line: j
								});
								var expirationdate = inventoryDeatilRec.getSublistText({
									sublistId: 'inventoryassignment',
									fieldId: 'expirationdate',
									line: j
								});
								if (j != 0) {
									itemText = ' ';
								}
								var emailObj = {
									'itemText': itemText,
									'sNo': sNo,
									'expirationdate': expirationdate,
									'quantity': quantity
								};
								log.debug('emailObj', emailObj);
								itemArr.push(emailObj);
								log.debug('itemArr', itemArr);
							}
						}
					}
				}
				log.debug('itemArr', itemArr);
				if (itemArr.length > 0) {
					var recipientEmails = record.load({
						type: 'customrecord_da_warranty_expiry_notifica',
						id: 1
					}).getValue('custrecord_da_expiry_notify_emails');
					var companyid = config.load({
						type: config.Type.COMPANY_INFORMATION
					}).getValue('companyid');
					log.debug('companyid', companyid);
					var userObj = runtime.getCurrentUser();
					log.debug('emailsToNotify', userObj.id);

					recipientEmails.push(userObj.id);
					var urlLink = "https://"+companyid+".app.netsuite.com/app/accounting/transactions/itemrcpt.nl?id="+scriptContext.newRecord.id;
					if (recipientEmails) {
						var htmlBody = '';
						for (i in itemArr) {
							htmlBody += '<tr><td>' + itemArr[i].itemText + '</td><td>' + itemArr[i].sNo + '</td><td>' + itemArr[i].expirationdate + '</td><td>' + itemArr[i].quantity + '</td></tr>';
						}
						htmlBody = '<b>Dears ,<br> Please find the below item(s) which have less than 6 month expiry</b><table border = "4"><tr><th>Item</th><th>Serail No</th><th>Expiration Date</th><th>Quantity</th></tr>' + htmlBody + '</table> <br><a href='+urlLink+'>View Record Link</a>';
						log.debug('s', htmlBody);
						email.sendBulk({
							author: -5,
							recipients: recipientEmails,
							subject: 'Items Expiration Date Notification (Less than 6 Months)',
							body: htmlBody
						});
					}
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});