/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/redirect','N/ui/serverWidget','N/search','N/runtime','N/record'],

		function(redirect,serverWidget,search,runtime,record) {

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
			var scriptObj = runtime.getCurrentScript();
          
          
          var hideFld = scriptContext.form.addField({
					id:'custpage_hide_buttons',
					label:'not shown - hidden',
					type: serverWidget.FieldType.INLINEHTML
				});

				//for every button you want to hide, modify the scr += line
				var scr = "";
				scr += 'jQuery("#custom102lnk").hide();';
                scr += 'jQuery("#custom99lnk").hide();';
         		scr += 'jQuery("#custom101lnk").hide();';
				//scr += 'jQuery("#recmachcustrecord_issue_material_child_remove").hide();';
				//push the script into the field so that it fires and does its handy work
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"

			if(scriptObj.deploymentId == "customdeploy_da_ue_categories"){

				/*var apprisalGroup = scriptContext.form.getField({id:'custrecord_app_group'});
				apprisalGroup.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/
				var questionID = scriptContext.form.getSublist({id : 'recmachcustrecord_app_category'}).getField({id:'custrecord_question_id'});
				questionID.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});

				var questionfeedback = scriptContext.form.getSublist({
					id : 'recmachcustrecord_app_category'
				}).getField({id:'custrecord_feedback'});
				questionfeedback.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				/*var categrory = scriptContext.form.getField({id:'custrecord_category_id'});
				categrory.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/
			}

			if(scriptObj.deploymentId == "customdeploy_da_ue_performance_org_app"){


				/*var relatedDataSublist = scriptContext.form.getSublist({
					id : 'recmachcustrecord_int_app_parent'
				});
				relatedDataSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;*/

				var employee = scriptContext.newRecord.getValue('custrecord_int_app_employee_id');
				var period = scriptContext.newRecord.getValue('custrecord_da_select_period');

				var approvalStatus = scriptContext.newRecord.getValue('custrecord_da_per_app_approval_status');

				

				if(scriptContext.type == 'create'){

				}

				var contextType = runtime.executionContext;

				if(scriptContext.type == 'edit' && approvalStatus != 4 && contextType == 'USERINTERFACE'){
                  
                  var appraisalGroupRecId = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_group_id')));

				var childCatIds = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_child_cat_ids')));

				var newcatIds = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_subtab_arr')));
					var count = scriptContext.newRecord.getLineCount({
						sublistId: 'recmachcustrecord_int_app_parent'
					});
					redirect.toSuitelet({
						scriptId: 'customscript_da_su_appraisal_form' ,
						deploymentId: 'customdeploy_da_su_appraisal_form',
						parameters: {
							'employee':employee,
							'period':period,
							'appraisalGroupRecId':appraisalGroupRecId,
							'recId': scriptContext.newRecord.id,
							'count':count,
							'newcatIds':newcatIds
						} 
					});
				}



				if(scriptContext.type == 'edit' && approvalStatus == 3 && contextType == 'USERINTERFACE'){				
					throw {
						error: 'Permission Error',
						message: " Sorry, You cant edit approved apprisal record"
					};
				}

				if(scriptContext.type == 'view'){
                  
                var appraisalGroupRecId = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_group_id')));

				var childCatIds = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_child_cat_ids')));

				var newcatIds = JSON.stringify(JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_subtab_arr')));
                  
					childCatIds = JSON.parse(childCatIds);
					appraisalGroupRecId = JSON.parse(appraisalGroupRecId);
                  if(childCatIds.length > 0){
					for (var i = 0;i <childCatIds.length;i++){
						log.debug("apprisalGroupId[i]",appraisalGroupRecId[i]);
						log.debug("childCatIds[i]",appraisalGroupRecId.indexOf(childCatIds[i]));
						if(appraisalGroupRecId.indexOf(childCatIds[i]) != -1){
							log.debug(true);
							var form = scriptContext.form;
							var fieldLookUp = search.lookupFields({
								type: 'customrecord_da_appraisal_categories',
								id: childCatIds[i],
								columns: ['name']
							});
							var empLeaves = form.addTab({
								id : 'custpage_subtab_'+childCatIds[i],
								label : fieldLookUp.name
							});  
							var subList = form.addSublist({
								id : 'custpage_sub_list_'+childCatIds[i],
								type : serverWidget.SublistType.LIST,
								label : fieldLookUp.name,
								tab:'custpage_subtab_'+childCatIds[i]
							});
							var engObjective = subList.addField({
								id: 'custpage_eng_objective',
								type: serverWidget.FieldType.SELECT,
								label: 'Objective',	
								source:'customrecord_da_appraisal_objectives'
							});
							var arabicObjective = subList.addField({
								id: 'custpage_arab_obje',
								type: serverWidget.FieldType.TEXT,
								label: 'Arabic Description'
							});
							var feedback = subList.addField({
								id: 'custpage_obj_feedback',
								type: serverWidget.FieldType.SELECT,
								label: 'Feedback',
								source:'customlist_ques_response_list'
							});
							var briefExp = subList.addField({
								id: 'custpage_obj_brief_exp',
								type: serverWidget.FieldType.TEXT,
								label: 'Brief Explaination',		
							});

							var customrecord_int_app_child_recordSearchObj = search.create({
								type: "customrecord_int_app_child_record",
								filters:
									[
										["custrecord_int_app_category","anyof",childCatIds[i]], 
										"AND", 
										["custrecord_int_app_parent","anyof",scriptContext.newRecord.id]
										],
										columns:
											[
												search.createColumn({name: "custrecord_int_app_category", label: "Category"}),
												search.createColumn({name: "custrecord_int_app_question_id", label: "Objective"}),
												search.createColumn({name: "custrecord_da_int_app_obj_arabic", label: "Objective /Arabic"}),
												search.createColumn({name: "custrecord_int_app_feedback", label: "Feedback"}),
												search.createColumn({name: "custrecord_da_app_brief_explanation", label: "Brief Explanation"}),
												search.createColumn({name: "custrecord_da_app_feedback_given_by", label: "Entered By"})
												]
							});
							var k = 0;
							var searchResultCount = customrecord_int_app_child_recordSearchObj.runPaged().count;
							log.debug("customrecord_int_app_child_recordSearchObj result count",searchResultCount);
							customrecord_int_app_child_recordSearchObj.run().each(function(result){
								subList.setSublistValue({
									id: 'custpage_eng_objective',
									line : k,
									value :result.getValue('custrecord_int_app_question_id')
								});
								subList.setSublistValue({
									id: 'custpage_arab_obje',
									line : k,
									value :(result.getValue('custrecord_da_int_app_obj_arabic'))?result.getValue('custrecord_da_int_app_obj_arabic'): ' '
								});
								subList.setSublistValue({
									id: 'custpage_obj_feedback',
									line : k,
									value :(result.getValue('custrecord_int_app_feedback'))?result.getValue('custrecord_int_app_feedback'):'0'
								});
								subList.setSublistValue({
									id: 'custpage_obj_brief_exp',
									line : k,
									value :(result.getValue('custrecord_da_app_brief_explanation'))?result.getValue('custrecord_da_app_brief_explanation'): ' '
								});
								k++;
								return true;
							});
						}
					}
                }

				}
			}


		}catch(ex){
			log.error(ex.name,ex.message);
		};
	}

	function beforeSubmit(scriptContext){
		try{
			var scriptObj = runtime.getCurrentScript();

			if(scriptObj.deploymentId == "customdeploy_da_ue_categories"){
				var evaulationIds = scriptContext.newRecord.getValue('custrecord_da_appraisal_evaluate_by');
				log.debug('evautionArr',evaulationIds);
			}
		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	function afterSubmit(scriptContext){

		try{
			var scriptObj = runtime.getCurrentScript();

			if(scriptObj.deploymentId == "customdeploy_da_ue_performance_org_app"){
				var apprisalGroupId = JSON.parse(scriptContext.newRecord.getValue('custrecord_da_app_group_id'));
				var customrecord_int_app_child_recordSearchObj = search.create({
					type: "customrecord_int_app_child_record",
					filters:
						[
							["custrecord_int_app_parent","anyof",scriptContext.newRecord.id]
							],
							columns:
								[
									search.createColumn({
										name: "custrecord_int_app_category",
										summary: "GROUP",
										label: "Category"
									})
									]
				});
				var searchResultCount = customrecord_int_app_child_recordSearchObj.runPaged().count;
				log.debug("customrecord_int_app_child_recordSearchObj result count",searchResultCount);
				var childCatIds = [];
				customrecord_int_app_child_recordSearchObj.run().each(function(result){
					childCatIds.push(result.getValue({name:'custrecord_int_app_category',summary:search.Summary.GROUP}))
					return true;
				});
				log.debug(typeof childCatIds + "  "+ typeof apprisalGroupId);
				//scriptContext.newRecord.setValue('custrecord_da_app_child_cat_ids',JSON.stringify(childCatIds));

				var newArrforSublist = [];


				for (var i = 0;i <apprisalGroupId.length;i++){
					log.debug("apprisalGroupId[i]",apprisalGroupId[i]);
					log.debug("childCatIds[i]",childCatIds.indexOf(apprisalGroupId[i]));
					if(childCatIds.indexOf(apprisalGroupId[i]) == -1){
						log.debug(true);
						newArrforSublist.push(apprisalGroupId[i]);
					}
				}

				var id = record.submitFields({
					type: 'customrecord_da_performance_appraisal',
					id: scriptContext.newRecord.id,
					values: {
						'custrecord_da_app_child_cat_ids':JSON.stringify(removeDuplicateUsingFilter(childCatIds.sort())),
						'custrecord_da_app_subtab_arr':JSON.stringify(removeDuplicateUsingFilter(newArrforSublist.sort()))
					},
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
			}
		}catch(ex){
			log.error(ex.name,ex.message);
		}



		//scriptContext.newRecord.setValue('custrecord_da_app_subtab_arr',JSON.stringify(newArrforSublist));
	}
  
  function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});