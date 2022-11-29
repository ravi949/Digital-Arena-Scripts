/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/file','N/render','N/ui/serverWidget','N/encode','N/runtime'],

function(search,record,file,render,ui,encode,runtime) {
   
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
			var request = context.request;
			var response = context.response;
			var parameters = request.parameters;
			var form = ui.createForm({
				title: 'Item Record change'
			});	
			var amount1 = form.addField({
				id: 'custpage_currency1',
				type: ui.FieldType.CURRENCY,
				label: 'amount1'
			}); 
            log.debug('parameters',parameters);
			 if(request.method == 'GET' && parameters.transId){
				 var payrunRec = record.load({
					 type:"customrecord_da_pay_run_scheduling",
					 id:parameters.transId
				 });
				 var postingPeriod=payrunRec.getText("custrecord_da_sch_pay_run_period");
				 
				 var xml = '<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n';
					xml += '<pdf>';
					xml += '<head><macrolist><macro id=\"myfooter\"><p align=\"center\"><pagenumber /></p></macro></macrolist><style>td,tr{border: 0.5px solid #dddddd;text-align: left;padding: 1px;}.btn { display: inline-block; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle;; padding: 10px;text-decoration:none:font-size:13px; line-height: 1.5; border-radius: .25rem; } .btn-primary { color: #fff; background-color: #007bff; font-weight:bold }</style></head>';
					xml += "<body size= \"A4\" footer=\"myfooter\" footer-height=\"0.5in\">";
					xml +=  '<br/><h2 align="center" style="text-align:center;color:#FEBB04">Payrun Report - '+postingPeriod+' </h2><br/><br/><table style="color:#039;border:solid black 3px;border-collapse:collapse;border-radius:6px;width:100%;height:105px">'+'<tbody>'+
					'<tr style="height: 23px;">'+
					'<td style="width: 50px; height: 23px;background-color: #dddddd"><strong>Payroll:</strong></td>'+
					'<td style="width: 50px; height: 23px;background-color: #dddddd">'+postingPeriod+'</td>'+
					'<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
					'<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
					'<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
					'</tr>';
					xml +='<tr style="height: 23px;">'+
					'<td style="width: 50px; height: 23px;"></td>'+
					'<td style="width: 50px; height: 23px;"></td>'+
					'<td style="width: 50px; height: 23px;"></td>'+
					'<td style="width: 50px; height: 23px;"></td>'+
					'<td style="width: 50px; height: 23px;"></td>'+
					'</tr>';
					xml+='<tr style="height: 23px;">'+
					'<td style="width: 50px; height: 23px;"><strong>Department</strong></td>'+
					'<td style="width: 50px; height: 23px;"><strong>Employee</strong></td>'+
					'<td style="width: 50px; height: 23px;"><strong>ItemType</strong></td>'+
					'<td style="width: 50px; height: 23px;"><strong>Payroll Item</strong></td>'+
					'<td style="width: 50px; height: 23px;"><strong>Amount</strong></td>'+
					'</tr>';





//					XML content of the file
					var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
					xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
					xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
					xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
					xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
					xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

					xmlStr += '<Worksheet ss:Name="Sheet1">';
					xmlStr += '<Table>' +
					'<Row>' +
					'<Cell><Data ss:Type="String"><html:B>Payroll: </html:B> </Data></Cell>' +
					'<Cell><Data ss:Type="String">'+postingPeriod+'</Data></Cell>' +
					'<Cell><Data ss:Type="String">  </Data></Cell>' +
					'<Cell><Data ss:Type="String"> </Data></Cell>' +
					'<Cell><Data ss:Type="String"></Data></Cell>' +

					'</Row>';
					xmlStr += '<Row>' +
					'<Cell><Data ss:Type="String"></Data></Cell>' +
					'<Cell><Data ss:Type="String"></Data></Cell>' +
					'<Cell><Data ss:Type="String"></Data></Cell>' +
					'<Cell><Data ss:Type="String"> </Data></Cell>' +
					'<Cell><Data ss:Type="String"></Data></Cell>' +

					'</Row>';
					xmlStr += '<Row>' +
					'<Cell><Data ss:Type="String"><html:B>Department </html:B> </Data></Cell>' +
					'<Cell><Data ss:Type="String"><html:B> Employee </html:B></Data></Cell>' +
					'<Cell><Data ss:Type="String"> <html:B>Item Type</html:B> </Data></Cell>' +
					'<Cell><Data ss:Type="String"><html:B>Payroll Item</html:B> </Data></Cell>' +
					'<Cell><Data ss:Type="String"><html:B>Amount </html:B></Data></Cell>' +

					'</Row>';
					
					var getCount=payrunRec.getLineCount("recmachcustrecord_da_pay_run_scheduling");
					var employeeArrayList = JSON.parse(payrunRec.getValue('custrecord_da_sch_pay_run_emplist'));
					var klen = employeeArrayList.length;
					log.debug('klen',klen);
					var departmentList = departmentSearch();
					
					var customrecord_da_pay_run_itemsSearchObj = search.create({
						   type: "customrecord_da_pay_run_items",
						   filters:
						   [
						     
						     
						   ],
						   columns:
						   [
						      search.createColumn({
						         name: "id",
						         sort: search.Sort.ASC,
						         label: "ID"
						      }),
						      search.createColumn({name: "custrecord_da_pay_run_item_department", label: "Department"}),
						      search.createColumn({name: "custrecord_da_pay_run_employee", label: "Employee"}),
						      search.createColumn({name: "custrecord_da_payroll_item_type", label: "Item Type"}),
						      search.createColumn({name: "custrecord_da_pay_run_paroll_items", label: "Payroll Item"}),
						      search.createColumn({name: "custrecord_da_pay_run_item_amount", label: "Amount"}),
						      search.createColumn({name: "custrecord_da_pay_run_item_hours", label: "Hours"})
						   ]
						});					
						
						
					for(var i=0;i<klen;i++){
						log.debug('empid',employeeArrayList[i]);
						customrecord_da_pay_run_itemsSearchObj.filters.pop({"name":"custrecord_da_pay_run_employee"});
						customrecord_da_pay_run_itemsSearchObj.filters.push(search.createFilter({
		    				"name"    : "custrecord_da_pay_run_scheduling",
		    				"operator": "anyof",
		    				"values"  : parameters.transId
		    			}));
						customrecord_da_pay_run_itemsSearchObj.filters.push(search.createFilter({
		    				"name"    : "custrecord_da_pay_run_employee",
		    				"operator": "anyof",
		    				"values"  : employeeArrayList[i]
		    			}));	
						 var total = 0;
						 var department;
						var first = true;
						 customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
							var employee = result.getText('custrecord_da_pay_run_employee')
							 department = result.getText('custrecord_da_pay_run_item_department');
							var payrollItem = result.getText('custrecord_da_pay_run_paroll_items');
							var itemType = result.getText('custrecord_da_payroll_item_type');
							var amount = result.getValue('custrecord_da_pay_run_item_amount');
							var hours = result.getValue('custrecord_da_pay_run_item_hours');
							
							if(itemType == "Deductions"){
								amount = -(amount);
							}
							if(hours > 0){
								amount = (hours * amount);
							}
							
							
							total = Math.round(parseFloat(total) + parseFloat(amount));
							if(itemType == "Earnings" && first == true){
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String">'+department+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+employee+'</Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px">'+department+'</td>'+
								'<td style="width: 50px; height: 23px;">'+employee+'</td>'+
								'<td style="width: 50px; height: 23px;">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;">'+amount+'</td>'+
								'</tr>';
							}
							if(itemType == "" && first == true){
                              log.audit(true);
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String">'+department+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+employee+'</Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px">'+department+'</td>'+
								'<td style="width: 50px; height: 23px;">'+employee+'</td>'+
								'<td style="width: 50px; height: 23px;">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;">'+amount+'</td>'+
								'</tr>';
							}
							if(itemType == "Deductions" && first == true){
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String">'+department+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+employee+'</Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+department+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+employee+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+amount+'</td>'+
								'</tr>';
							}
							if(itemType == "Earnings" && first == false){
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;">'+amount+'</td>'+
								'</tr>';
							}
							if(itemType == "Deductions" && first == false){
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE"></td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE"></td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+amount+'</td>'+
								'</tr>';
							}
							if(itemType == ""  && first == false){
                               log.audit(false);
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +

								'<Cell><Data ss:Type="String">'+itemType+'</Data></Cell>' +


								'<Cell><Data ss:Type="String">'+payrollItem+'</Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+amount+'</Data></Cell>' +
								'</Row>';
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE"></td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE"></td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+itemType+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+payrollItem+'</td>'+
								'<td style="width: 50px; height: 23px;background-color: #C49FAE">'+amount+'</td>'+
								'</tr>';
							}
							var td="sdd";
							first = false;
							
							return true;
							});
						 if(total>0)
						 {
							 log.debug('total amount');
							 xml+= '<tr style="height: 23px;">'+
							 '<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
							 '<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
							 '<td style="width: 50px; height: 23px;background-color: #dddddd"></td>'+
							 '<td style="width: 50px; height: 23px;background-color: #dddddd"><strong>Total</strong></td>'+
							 '<td style="width: 50px; height: 23px;background-color: #dddddd"><strong>'+total+'</strong></td>'+
							 '</tr>';
							 xml+= '<tr style="height: 23px;">'+
							 '<td style="width: 50px; height: 23px;"></td>'+
							 '<td style="width: 50px; height: 23px;"></td>'+
							 '<td style="width: 50px; height: 23px;"></td>'+
							 '<td style="width: 50px; height: 23px;"></td>'+
							 '<td style="width: 50px; height: 23px;"></td>'+
							 '</tr>';

							 xmlStr += '<Row>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +
							 '<Cell><Data ss:Type="String"> <html:B>Total</html:B></Data></Cell>' +
							 '<Cell><Data ss:Type="Number">'+total+'</Data></Cell>' +
							 '</Row>';
							 xmlStr += '<Row>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +

							 '<Cell><Data ss:Type="String"></Data></Cell>' +

							 '<Cell><Data ss:Type="String"> </Data></Cell>' +
							 '<Cell><Data ss:Type="String"></Data></Cell>' +
							 '</Row>';
						 }
						 log.audit('department',typeof department);
						 if(department.length > 0 && total > 0){
								xml +='<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"><strong>Department Total</strong></td>'+
								'<td style="width: 50px; height: 23px;"><strong>'+total+'</strong></td>'+
								'</tr>';
								xml += '<tr style="height: 23px;">'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'<td style="width: 50px; height: 23px;"></td>'+
								'</tr>';
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +

								'<Cell><Data ss:Type="String"></Data></Cell>' +

								'<Cell><Data ss:Type="String"> <html:B>Department Total</html:B></Data></Cell>' +
								'<Cell><Data ss:Type="Number">'+total+'</Data></Cell>' +
								'</Row>';
								xmlStr += '<Row>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"> </Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'</Row>';
						 }
					}
//					for(var m=0;m<(departmentList.length+1);m++){}
					
					xmlStr += '</Table></Worksheet></Workbook>';
					log.debug('xmlStr',xmlStr);
					
					var reencoded = encode.convert({
					    string: xmlStr,
					    inputEncoding: encode.Encoding.UTF_8,
					    outputEncoding: encode.Encoding.BASE_64
					});
					
					//search to get folder internalid
					var folderId = 0;
					var folderSearchObj = search.create({
						type: "folder",
						filters:
							[
								["name","contains","payrun"]
								],
								columns:
									[
										search.createColumn({
											name: "name",
											sort: search.Sort.ASC,
											label: "Name"
										})

										]
					}).run().getRange(0,1);
					if(folderSearchObj.length > 0){
						folderId = folderSearchObj[0].id;
						log.debug('res',folderSearchObj[0].id);
					}
					var fileObj = file.create({
					    name: 'Payrun_'+postingPeriod+'.xls',
					    fileType: file.Type.EXCEL,
					    contents:reencoded,
//					    encoding: file.Encoding.BASE_64,
					    folder: (folderId)?folderId:-10,
					    isOnline: true
					});
					var fileId = fileObj.save();
					log.debug('fileId',fileId);
					var fileObj = file.load({
					    id: fileId
					});
					log.debug('fileId',fileId);
					var docId = fileObj.url;
					log.debug('URL',docId);
					var exportExcelUrl = 'https://system.netsuite.com'+docId;
					log.debug('zzz',exportExcelUrl);
//					
					xml+= "</tbody></table>";
					xml+='<br/><div align="center"><a class="btn btn-primary" href="'+exportExcelUrl+'">Export as Excel</a></div>';
//
					xml+="</body></pdf>";
					xml = xml.replace(/\&/g, "&amp;");
					
					var pdfFile = render.xmlToPdf({
					    xmlString: xml
					});
//                    context.form.clientScriptModulePath = 'SuiteScripts/DA_CS_Payrun_Scheduling.js';
					response.setHeader({
						name: 'Content-Type',
						value: 'PDF',
					});					
					log.debug('content',pdfFile.getContents());
					
					 var renderer = render.create();
			         renderer.templateContent = xml;
			         var invoicePdf = renderer.renderAsPdf();
//					response.renderPDF({
//					    xmlString:xml
//					});
//					response.write(invoicePdf);  
			         var scriptObj = runtime.getCurrentScript();
			         log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
					response.writeFile(invoicePdf);
			 }

		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}
	
	function departmentSearch(){
		var departmentSearchObj = search.create({
			type: "department",
			filters:
				[
					],
					columns:
						[
							search.createColumn({
								name: "name",
								sort: search.Sort.ASC,
								label: "Name"
							})
							]
		});
		var searchResultCount = departmentSearchObj.runPaged().count;
		log.debug("departmentSearchObj result count",searchResultCount);
		var deptArr = [];
		departmentSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			log.debug('res',result.getValue('name'));
			deptArr.push(result.getValue('name'))
			return true;
		});
		return deptArr;
	}

    return {
        onRequest: onRequest
    };
    
});