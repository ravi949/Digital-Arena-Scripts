/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/record','N/ui/serverWidget', 'N/search','N/runtime','N/redirect', 'N/format', 'N/url'],

		function(record, ui, search,runtime,redirect, format, url) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
			var request = context.request;
			var response = context.response;

			if (context.request.method === 'GET') {


				var form = ui.createForm({
					title: 'ECL Provision Calculation'
				});
				var tab = form.addSubtab({
					id: 'custpage_tab',
					label: 'Provision Calculation'
				});
				var dateField = form.addField({
					id: 'custpage_date',
					type: ui.FieldType.DATE,
					label: 'Date',
					container: 'custpage_tab'
				});
				dateField.updateDisplaySize({
					height: 200,
					width: 100
				});
				var customerCategory = form.addField({
					id: 'custpage_customer_category',
					type: ui.FieldType.SELECT,
					label: 'Customer Category',
					container: 'custpage_tab',
					source:'customercategory'
				});
				var subsidiary = form.addField({
					id: 'custpage_subsidiary',
					type: ui.FieldType.SELECT,
					label: 'Subsidiary',
					container: 'custpage_tab',
					source:'subsidiary'
				});
				var calculationAsOf = form.addField({
					id: 'custpage_cal_as_of',
					type: ui.FieldType.SELECT,
					label: 'Calculation As Of',
					container: 'custpage_tab',
					source:'accountingperiod'
				});
				calculationAsOf.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				calculationAsOf.updateDisplayType({
    				displayType : ui.FieldDisplayType.HIDDEN
				});
				//ECL Provision Calculation Sublist			
				var eclProvisionCal = form.addSublist({
					id: 'custpage_ecl_prov_cal',
					type: ui.SublistType.LIST,
					label: 'ECL Provision Calculation',
					tab: 'custpage_tab'
				});
				

				eclProvisionCal.addField({
					id: 'custpage_ecl_bucket',
					type: ui.FieldType.TEXT,
					label: 'Bucket'
				});	
				eclProvisionCal.addField({
					id: 'custpage_avg_flow_rates',
					type: ui.FieldType.PERCENT,
					label: 'Average Flow Rates'
				});
				eclProvisionCal.addField({
					id: 'custpage_loss_rate_for_bucket',
					type: ui.FieldType.PERCENT,
					label: 'Loss Rate For Each Bucket'
				});
				eclProvisionCal.addField({
					id: 'custpage_ecl_flr',
					type: ui.FieldType.PERCENT,
					label: 'FLR'
				});
				eclProvisionCal.addField({
					id: 'custpage_outstanding_amount',
					type: ui.FieldType.CURRENCY,
					label: 'Outstanding Amount'
				});
				eclProvisionCal.addField({
					id: 'custpage_provision',
					type: ui.FieldType.CURRENCY,
					label: 'Provision'
				});
				var postingPeriodId = request.parameters.postingPeriodId;
                log.debug('postingPeriodId',postingPeriodId);
                
                

                if(request.parameters.customerCategory){
                  	customerCategory.defaultValue = request.parameters.customerCategory;
				}
				var customerCategory = request.parameters.customerCategory;
                	log.debug('customerCategory',customerCategory);
				if(request.parameters.subsidiary){
                  	subsidiary.defaultValue = request.parameters.subsidiary;
				}
				var subsidiary = request.parameters.subsidiary;
                	log.debug('subsidiary',subsidiary);
				if(request.parameters.dateField){
					var startTomorrow = new Date(request.parameters.dateField);
                 //   startTomorrow.setDate(startTomorrow.getDate()+1);
                  	dateField.defaultValue = startTomorrow;
                  	calculationAsOf.defaultValue = postingPeriodId;
				}
				dateField = request.parameters.dateField;
				if(dateField){
					var dateFieldLength = dateField.length;

				     log.debug('dateFieldLength',dateFieldLength);
				}else{
					var dateFieldLength = 1;
				}
				
				if(dateFieldLength > 1){
						
						form.addSubmitButton({
						    label : 'Submit'
						});
					}
					
                    
                    
					if(postingPeriodId && customerCategory && subsidiary){
						var customrecord_da_ecl_againgSearchObj = search.create({
                        type: "customrecord_da_ecl_againg",
                        filters:
                            [
                                ["custrecord_da_ecl_period",'anyof',postingPeriodId], "AND", ["custrecord_da_ecl_customer_category",'anyof',customerCategory]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "created",
                                            sort: search.Sort.DESC,
                                            label: "Date Created"
                                        }),
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Internal Id"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_period",
                                            label: "Posting Period"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_aging_bucket",
                                            label: "Not Due"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_1_3_months_bucket",
                                            label: "1_3 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_4_6_months_bucket",
                                            label: "4_6 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_7_12_months_bucket",
                                            label: "7_12 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_13_24_months_bucket",
                                            label: "13_24 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_25_36_months_bucket",
                                            label: "25_36 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_36_months_bucket",
                                            label: "36 Months Above"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_overall_percentage",
                                            label: "Overall Percentage"
                                        })
                                        ]
                    });
                    var searchCount = customrecord_da_ecl_againgSearchObj.runPaged().count;
                    log.debug("customrecord_da_ecl_againgSearchObj result count",searchCount);
                    var internalID, postingPeriod, notDue, Months1_3, Months4_6, Months7_12, Months13_24, Months25_36, above36Months;
                    customrecord_da_ecl_againgSearchObj.run().each(function(result){
                        internalID = result.getValue("internalid");
                        log.debug('internalID',internalID);
                        postingPeriod = result.getValue("custrecord_da_ecl_period");
                        log.debug('postingPeriod',postingPeriod);
                        notDue = result.getValue("custrecord_da_ecl_aging_bucket");
                        log.debug('notDue',notDue);
                        Months1_3 = result.getValue("custrecord_da_ecl_1_3_months_bucket");
                        log.debug('Months1_3',Months1_3);
                        Months4_6 = result.getValue("custrecord_da_ecl_4_6_months_bucket");
                        log.debug('Months4_6',Months4_6);
                        Months7_12 = result.getValue("custrecord_da_ecl_7_12_months_bucket");
                        log.debug('Months7_12',Months7_12);
                        Months13_24 = result.getValue("custrecord_da_ecl_13_24_months_bucket");
                        log.debug('Months13_24',Months13_24);
                        Months25_36  = result.getValue("custrecord_da_ecl_25_36_months_bucket");
                        log.debug('Months25_36',Months25_36);
                        above36Months  = result.getValue("custrecord_da_ecl_36_months_bucket");
                        log.debug('above36Months',above36Months);
                    	overallPercentage  = result.getValue("custrecord_da_ecl_overall_percentage");
                        log.debug('overallPercentage',overallPercentage);
                        });
                    if(searchCount > 0 && overallPercentage){
                    	eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 0,
						value: "Current"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 1,
						value: "1 to 3 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 2,
						value: "4 to 6 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 3,
						value: "7 to 12 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 4,
						value: "13 to 24 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 5,
						value: "25 to 36 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 6,
						value: "Above 36 Months"
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_bucket',
						line: 7,
						value: "Total"
					});
					
					
					
					var eclAgingFlowRatesSearch = search.create({
                        type: "customrecord_da_ecl_average_flow_rate",
                        filters:
                            [
                                ["custrecord_da_ecl_avg_customer_category",'anyof',customerCategory]
                                ],
                        columns:
                                    [   
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_not_due_percent",
                                            label: "Not Due"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_1_3_month_pcent",
                                            label: "month1_3"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_4_6_month_pcent",
                                            label: "month4_6"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_7_12_month_pcent",
                                            label: "month7_12"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_13_24_month_pcent",
                                            label: "month13_24"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_25_36_month_pcent",
                                            label: "month25_36"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_avg_abv_36_month_pcent",
                                            label: "above36_months"
                                        })
                                        ]
                    });
                    var count = eclAgingFlowRatesSearch.runPaged().count;
                    log.debug('count',count);
                    var notDue, month1_3, month4_6, month7_12, month13_24, month25_36;
                    eclAgingFlowRatesSearch.run().each(function(result) {
                        notDuePer = result.getValue({
                            name: 'custrecord_da_ecl_avg_not_due_percent'
                        });
                        log.debug('notDuePer',notDuePer);
                        month1_3 = result.getValue({
                            name: 'custrecord_da_ecl_avg_1_3_month_pcent'
                        });
                        log.debug('month1_3',month1_3);
                        month4_6 = result.getValue({
                            name: 'custrecord_da_ecl_avg_4_6_month_pcent'
                        });
                        log.debug('month4_6',month4_6);
                        month7_12 = result.getValue({
                            name: 'custrecord_da_ecl_avg_7_12_month_pcent'
                        });
                        log.debug('month7_12',month7_12);
                        month13_24 = result.getValue({
                            name: 'custrecord_da_ecl_avg_13_24_month_pcent'
                        });
                        log.debug('month13_24',month13_24);
                        month25_36 = result.getValue({
                            name: 'custrecord_da_ecl_avg_25_36_month_pcent'
                        });
                        log.debug('month25_36',month25_36);
                        above36_months = result.getValue({
                            name: 'custrecord_da_ecl_avg_abv_36_month_pcent'
                        });
                        log.debug('above36_months',above36_months);
                    });

                    //Average Flow Rates
                    eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 0,
						value: notDuePer
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 1,
						value: month1_3
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 2,
						value: month4_6
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 3,
						value: month7_12
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 4,
						value: month13_24
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 5,
						value: month25_36
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_avg_flow_rates',
						line: 6,
						value: above36_months
					});
					

					//Loss Rate For Bucket
					var notDueLossRate = ((parseFloat(notDuePer)/100) * (parseFloat(month1_3)/100) * (parseFloat(month4_6)/100) * (parseFloat(month7_12)/100) * (parseFloat(month13_24)/100) * (parseFloat(month25_36)/100)) * 100;
					notDueLossRate = notDueLossRate.toFixed(2);
					log.debug('notDueLossRate',notDueLossRate);
					var month1_3LossRate = ((parseFloat(month1_3)/100) * (parseFloat(month4_6)/100) * (parseFloat(month7_12)/100) * (parseFloat(month13_24)/100) * (parseFloat(month25_36)/100)) * 100;
					month1_3LossRate = month1_3LossRate.toFixed(2);
					log.debug('month1_3LossRate',month1_3LossRate);
					var month4_6LossRate = ((parseFloat(month4_6)/100) * (parseFloat(month7_12)/100) * (parseFloat(month13_24)/100) * (parseFloat(month25_36)/100)) * 100;
					month4_6LossRate = month4_6LossRate.toFixed(2);
					log.debug('month4_6LossRate',month4_6LossRate);
					var month7_12LossRate = ((parseFloat(month7_12)/100) * (parseFloat(month13_24)/100) * (parseFloat(month25_36)/100)) * 100;
					month7_12LossRate = month7_12LossRate.toFixed(2);
					log.debug('month7_12LossRate',month7_12LossRate);
					var month13_24LossRate = ((parseFloat(month13_24)/100) * (parseFloat(month25_36)/100)) * 100;
					month13_24LossRate = month13_24LossRate.toFixed(2);
					log.debug('month13_24LossRate',month13_24LossRate);
					var month25_36LossRate = ((parseFloat(month25_36)/100)) * 100;
					month25_36LossRate = month25_36LossRate.toFixed(2);
					log.debug('month25_36LossRate',month25_36LossRate);
					var above36_monthsLossRate = (parseFloat(above36_months)) * (1 - (parseFloat(overallPercentage)/100));
					above36_monthsLossRate = above36_monthsLossRate.toFixed(2);
					log.debug('above36_monthsLossRate',above36_monthsLossRate);

					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 0,
						value: notDueLossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 1,
						value: month1_3LossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 2,
						value: month4_6LossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 3,
						value: month7_12LossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 4,
						value: month13_24LossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 5,
						value: month25_36LossRate
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_loss_rate_for_bucket',
						line: 6,
						value: above36_monthsLossRate
					});
					

					// FLR
					var eclSettingsRec = record.load({
                            type: 'customrecord_da_ecl_setting',
                            id: '1',
                            isDynamic: true
                        });
					var gdpValue = eclSettingsRec.getValue('custrecord_da_ecl_gdp');
					log.debug('gdpValue',gdpValue);

					var notDueFLR = (parseFloat(notDueLossRate) * (1 + (parseFloat(gdpValue)/100)));
					notDueFLR = notDueFLR.toFixed(2);
					log.debug('notDueFLR',notDueFLR);
					var month1_3LossRateFLR = (parseFloat(month1_3LossRate) * (1 + (parseFloat(gdpValue)/100)));
					month1_3LossRateFLR = month1_3LossRateFLR.toFixed(2);
					log.debug('month1_3LossRateFLR',month1_3LossRateFLR);
					var month4_6LossRateFLR = (parseFloat(month4_6LossRate) * (1 + (parseFloat(gdpValue)/100)));
					month4_6LossRateFLR = month4_6LossRateFLR.toFixed(2);
					log.debug('month4_6LossRateFLR',month4_6LossRateFLR);
					var month7_12LossRateFLR = (parseFloat(month7_12LossRate) * (1 + (parseFloat(gdpValue)/100)));
					month7_12LossRateFLR = month7_12LossRateFLR.toFixed(2);
					log.debug('month7_12LossRateFLR',month7_12LossRateFLR);
					var month13_24LossRateFLR = (parseFloat(month13_24LossRate) * (1 + (parseFloat(gdpValue)/100)));
					month13_24LossRateFLR = month13_24LossRateFLR.toFixed(2);
					log.debug('month13_24LossRateFLR',month13_24LossRateFLR);
					var month25_36LossRateFLR = (parseFloat(month25_36LossRate) * (1 + (parseFloat(gdpValue)/100)));
					month25_36LossRateFLR = month25_36LossRateFLR.toFixed(2);
					log.debug('month25_36LossRateFLR',month25_36LossRateFLR);
					var above36_monthsLossRateFLR = (parseFloat(above36_monthsLossRate) * (1 + (parseFloat(gdpValue)/100)));
					above36_monthsLossRateFLR = above36_monthsLossRateFLR.toFixed(2);
					log.debug('above36_monthsLossRateFLR',above36_monthsLossRateFLR);

					
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 0,
						value: notDueFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 1,
						value: month1_3LossRateFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 2,
						value: month4_6LossRateFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 3,
						value: month7_12LossRateFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 4,
						value: month13_24LossRateFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 5,
						value: month25_36LossRateFLR
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_ecl_flr',
						line: 6,
						value: above36_monthsLossRateFLR
					});
					
					//Outstanding amount
					var totalOutStandingAmt = 0;
					totalOutStandingAmt = parseFloat(notDue) + parseFloat(Months1_3) + parseFloat(Months4_6) + parseFloat(Months7_12) +parseFloat(Months13_24) + parseFloat(Months25_36) + parseFloat(above36Months);
					log.debug('totalOutStandingAmt',totalOutStandingAmt);
					totalOutStandingAmt = totalOutStandingAmt.toFixed(2);
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 0,
						value: notDue
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 1,
						value: Months1_3
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 2,
						value: Months4_6
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 3,
						value: Months7_12
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 4,
						value: Months13_24
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 5,
						value: Months25_36
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 6,
						value: above36Months
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_outstanding_amount',
						line: 7,
						value: totalOutStandingAmt
					});
					// Provision
					var notDueProvision = (parseFloat(notDueFLR)/100) * (parseFloat(notDue));
					notDueProvision = notDueProvision.toFixed(2);
					log.debug('notDueProvision',notDueProvision);
					var Months1_3Provision = (parseFloat(month1_3LossRateFLR)/100) * (parseFloat(Months1_3));
					Months1_3Provision = Months1_3Provision.toFixed(2);
					log.debug('Months1_3Provision',Months1_3Provision);
					var Months4_6Provision = (parseFloat(month4_6LossRateFLR)/100) * (parseFloat(Months4_6));
					Months4_6Provision = Months4_6Provision.toFixed(2);
					log.debug('Months4_6Provision',Months4_6Provision);
					var Months7_12Provision = (parseFloat(month7_12LossRateFLR)/100) * (parseFloat(Months7_12));
					Months7_12Provision = Months7_12Provision.toFixed(2);
					log.debug('Months7_12Provision',Months7_12Provision);
					var Months13_24Provision = (parseFloat(month13_24LossRateFLR)/100) * (parseFloat(Months13_24));
					Months13_24Provision = Months13_24Provision.toFixed(2);
					log.debug('Months13_24Provision',Months13_24Provision);
					var Months25_36Provision = (parseFloat(month25_36LossRateFLR)/100) * (parseFloat(Months25_36));
					Months25_36Provision = Months25_36Provision.toFixed(2);
					log.debug('Months25_36Provision',Months25_36Provision);
					var above36MonthsProvision = (parseFloat(above36_monthsLossRateFLR)/100) * (parseFloat(above36Months));
					above36MonthsProvision = above36MonthsProvision.toFixed(2);
					log.debug('above36MonthsProvision',above36MonthsProvision);
                    var totalProvision = 0;
					totalProvision = parseFloat(notDueProvision) + parseFloat(Months1_3Provision) + parseFloat(Months4_6Provision) + parseFloat(Months7_12Provision) +parseFloat(Months13_24Provision) + parseFloat(Months25_36Provision) + parseFloat(above36MonthsProvision);
					log.debug('totalProvision',totalProvision);
					totalProvision = totalProvision.toFixed(2);
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 0,
						value: notDueProvision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 1,
						value: Months1_3Provision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 2,
						value: Months4_6Provision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 3,
						value: Months7_12Provision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 4,
						value: Months13_24Provision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 5,
						value: Months25_36Provision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 6,
						value: above36MonthsProvision
					});
					eclProvisionCal.setSublistValue({
						id: 'custpage_provision',
						line: 7,
						value: totalProvision
					});
                    }
					}
				
					
				context.response.writePage(form);
				form.clientScriptModulePath = './DA_CS_ECL_Provision_Calculation.js'

			}else{
				log.debug('else');
				var postingPeriodId = request.parameters.custpage_cal_as_of;
				log.debug('postingPeriodId',postingPeriodId);
				var dateField = request.parameters.custpage_date;
				log.debug('dateField',dateField);
				var customerCategory = request.parameters.custpage_customer_category;
				log.debug('customerCategory',customerCategory);
				var subsidiary = request.parameters.custpage_subsidiary;
				log.debug('subsidiary',subsidiary);
				var numLines = request.getLineCount({
					group: 'custpage_ecl_prov_cal'
				});
				var bucket , avgFlowRate , lossRateforBucket, eclFLR, OutstandingAmt, eclProvision;
				
				for(var i= 0;i < numLines-1 ;i++){
					bucket = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_ecl_bucket',
						line: i
					});
					avgFlowRate = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_avg_flow_rates',
						line: i
					});
					lossRateforBucket = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_loss_rate_for_bucket',
						line: i
					});
                    
                    eclFLR = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_ecl_flr',
						line: i
					});
					OutstandingAmt = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_outstanding_amount',
						line: i
					});
					eclProvision = request.getSublistValue({
						group: 'custpage_ecl_prov_cal',
						name : 'custpage_provision',
						line: i
					});
					log.debug('bucket',bucket);
					log.debug('avgFlowRate',avgFlowRate);
					//var avgFlowRate1 = avgFlowRate.replace('%', '');
					//log.debug('avgFlowRate1',avgFlowRate1);
					log.debug('lossRateforBucket',lossRateforBucket);
					log.debug('eclFLR',eclFLR);
					log.debug('OutstandingAmt',OutstandingAmt);
					log.debug('eclProvision',eclProvision);
					var provisionRec = record.create({
                            type: 'customrecord_da_ecl_provision_calculatio',
                            isDynamic: true
                        });
					provisionRec.setValue('custrecord_da_ecl_calculation_as_of',postingPeriodId);
					provisionRec.setValue('custrecord_da_provision_bucket',bucket);
					provisionRec.setText('custrecord_da_avegrage_flow_rate',avgFlowRate);
					provisionRec.setValue('custrecord_da_loss_rate_for_each',lossRateforBucket);
					provisionRec.setValue('custrecord_da_flr_provision',eclFLR);
					provisionRec.setValue('custrecord_da_outstanding_amount',OutstandingAmt);
					provisionRec.setValue('custrecord_da_ecl_provision_amount',eclProvision);
                  provisionRec.setText('custrecord_da_ecl_date',dateField);
					provisionRec.setValue('custrecord_da_ecl_provision_cust_categ',customerCategory);
					provisionRec.setValue('custrecord_da_ecl_provision_subsidiary',subsidiary);
					var provisionRecId = provisionRec.save();
					log.debug('provisionRecId',provisionRecId);
					
				}
				var output1 = url.resolveScript({
                      scriptId: 'customscript_da_su_ecl_provision_calcula',
                      deploymentId: 'customdeploy_da_su_ecl_provision_calcula',
                      returnExternalUrl: false
                }); 
                log.debug('output1',output1);
                redirect.redirect({url: output1});
				
			}			

		} catch (ex) {
			log.error(ex.name, ex.message);
		}
	}
	

	
	return {
		onRequest: onRequest
	};

});