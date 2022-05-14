
/**
 * カテゴリーの新規/既存切り替えラジオボタン
 * 対象：bookmark/edit_form,bookmark/register_form
 * checkValue: 0=既存、1=新規
 */
const input_select_category = document.getElementById('select_category');
const input_reg_category = document.getElementById('reg_category');
let category = document.getElementsByName('category');
let checkValue = '';

function getCategoryRadio() {
  for (let i = 0; i < category.length; i++) {
    if (category.item(i).checked) {
      checkValue = category.item(i).value;
      if (checkValue == "0") {
        input_select_category.disabled = false
        input_reg_category.disabled = true;
        input_reg_category.value = "";
      } else {
        input_select_category.disabled = true
        input_reg_category.disabled = false;
        input_select_category.value = "";
      }
    }
  }
}

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
