/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],
    function( search, record) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {

            	var customrecord_da_amm_grade_resultsSearchObj = search.create({
				   type: "customrecord_da_amm_grade_results",
				   filters:
				   [
				      ["custrecord_da_generate_grade_aprent","anyof",scriptContext.newRecord.id]
				   ],
				   columns:
				   [
				      search.createColumn({name: "internalid", label: "Internal ID"})
				   ]
				});
				var searchResultCount = customrecord_da_amm_grade_resultsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_grade_resultsSearchObj result count",searchResultCount);
				customrecord_da_amm_grade_resultsSearchObj.run().each(function(result){
				   record.delete({
					   	type:'customrecord_da_amm_grade_results',
					   	id: result.id
				   })
				   return true;
				});

				var gradeRec = record.load({
					type:'customrecord_da_amm_generate_grades',
					id : scriptContext.newRecord.id,
                    isDynamic: true
				})

				var customrecord_da_amm_batch_studentsSearchObj = search.create({
				   type: "customrecord_da_amm_batch_students",
				   filters:
				   [
				      ["custrecord_da_amm_test_parent.custrecord_da_amm_test_batch","anyof",scriptContext.newRecord.getValue('custrecord_da_genarate_grade_batch')]
				   ],
				   columns:
				   [
				      search.createColumn({
				         name: "custrecord_da_batch_student_name",
				         summary: "GROUP",
				         label: "Student"
				      }),
				      search.createColumn({
				         name: "custrecord_da_batch_student_sub_marks",
				         summary: "SUM",
				         label: "Max Marks"
				      }),
				      search.createColumn({
				         name: "custrecord_da_student_marks_obtained",
				         summary: "SUM",
				         label: "Marks Obtained"
				      })
				   ]
				});
				var searchResultCount = customrecord_da_amm_batch_studentsSearchObj.runPaged().count;
				log.debug("customrecord_da_amm_batch_studentsSearchObj result count",searchResultCount);
				customrecord_da_amm_batch_studentsSearchObj.run().each(function(result){
				   var student = result.getValue({
					   	name:'custrecord_da_batch_student_name',
					   	summary : search.Summary.GROUP
				   });

				   var maxMarks = result.getValue({
					   	name:'custrecord_da_batch_student_sub_marks',
					   	summary : search.Summary.SUM
				   });

				   var marksObtained = result.getValue({
					   	name:'custrecord_da_student_marks_obtained',
					   	summary : search.Summary.SUM
				   });

				   gradeRec.selectNewLine({
				   	sublistId:'recmachcustrecord_da_generate_grade_aprent'
				   });
				   gradeRec.setCurrentSublistValue({
					   	sublistId:'recmachcustrecord_da_generate_grade_aprent',
					   	fieldId:'custrecord_da_grade_result_student',
					   	value: student
				   });
				   gradeRec.setCurrentSublistValue({
					   	sublistId:'recmachcustrecord_da_generate_grade_aprent',
					   	fieldId:'custrecord_da_total_max_marks',
					   	value: maxMarks
				   });
				   gradeRec.setCurrentSublistValue({
					   	sublistId:'recmachcustrecord_da_generate_grade_aprent',
					   	fieldId:'custrecord_da_total_marks_obtained',
					   	value: marksObtained
				   });

				   var percent = ((marksObtained/maxMarks)*100).toFixed(2);
				   log.debug(percent);
				   gradeRec.setCurrentSublistValue({
					   	sublistId:'recmachcustrecord_da_generate_grade_aprent',
					   	fieldId:'custrecord_da_garde_result_percent',
					   	value: percent
				   });
                  
                   var obtainedGrade ;
                   if(percent >= 75){
                     obtainedGrade = 1;
                   }
                   if(percent >= 65 && percent < 75){
                     obtainedGrade = 2;
                   }
                   if(percent >= 50 && percent < 65){
                     obtainedGrade = 3;
                   }
                  if(percent < 50){
                     obtainedGrade = 4;
                   }
                  gradeRec.setCurrentSublistValue({
					   	sublistId:'recmachcustrecord_da_generate_grade_aprent',
					   	fieldId:'custrecord_da_obtained_grade',
					   	value: obtainedGrade
				   });

				   gradeRec.commitLine({
				   	 sublistId:'recmachcustrecord_da_generate_grade_aprent'
				   })

				   return true;
				});

				gradeRec.save();

                
                
               
               
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });