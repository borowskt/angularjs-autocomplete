(function(){
  'use strict';
  var $compile;

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // accepted attributes
  var autoCompleteAttrs = [
    'placeholder',
    'ngModel', 'valueChanged', 'source', 'pathToData', 'minChars',
    'defaultStyle', 'valueProperty', 'displayProperty'
  ];

  // build autocomplet-div tag with input and select
  var buildACDiv = function(controlEl, attrs) {
    var acDiv = document.createElement('auto-complete-div');
    var controlBCR = controlEl.getBoundingClientRect();
    acDiv.controlEl = controlEl;

    var inputEl = document.createElement('input');
    attrs.placeholder = attrs.placeholder || 'Select';
    inputEl.setAttribute('placeholder', attrs.placeholder);
    inputEl.setAttribute('size', attrs.placeholder.length);

    attrs.ngDisabled && 
      inputEl.setAttribute('ng-disabled', attrs.ngDisabled);
    acDiv.appendChild(inputEl);

    var ulEl = document.createElement('ul');
    acDiv.appendChild(ulEl);

    autoCompleteAttrs.map(function(acAttr) {
      if (attrs[acAttr]) {
        var attrValue = attrs[acAttr];
        acDiv.setAttribute(dasherize(acAttr), attrValue);
      }
    });
    acDiv.style.position = 'absolute';
    //acDiv.style.display = 'none';
    return acDiv;
  };

  var buildMultiACDiv = function(controlEl, attrs) {
    var deleteLink = document.createElement('button');
    deleteLink.innerHTML = 'x';
    deleteLink.className += ' delete';
    deleteLink.setAttribute('ng-click', attrs.ngModel+'.splice($index, 1); $event.stopPropagation()');

    var ngRepeatDiv = document.createElement('span');
    ngRepeatDiv.className += ' auto-complete-repeat';
    ngRepeatDiv.setAttribute('ng-repeat', 
      'obj in '+attrs.ngModel+' track by $index');
    ngRepeatDiv.innerHTML = '{{obj["'+attrs.displayProperty+'"] || obj}}';
    ngRepeatDiv.appendChild(deleteLink);

    var multiACDiv = document.createElement('div');
    multiACDiv.className = 'auto-complete-div-multi-wrapper';
    multiACDiv.appendChild(ngRepeatDiv);
    
    return multiACDiv;
  };

  var linkFunc = function(scope, element, attrs)  {
    element[0].style.position = 'relative';

    var controlEl = element[0].querySelector('select');
    controlEl.style.display = 'none';
    controlEl.multiple = true;

    attrs.valueProperty = attrs.valueProperty || 'id';
    attrs.displayProperty = attrs.displayProperty || 'value';
    attrs.ngModel = controlEl.getAttribute('ng-model');

    // 1. build <auto-complete-div>
    var multiACDiv = buildMultiACDiv(controlEl, attrs);
    var acDiv = buildACDiv(controlEl, attrs);
    multiACDiv.appendChild(acDiv);
    element[0].appendChild(multiACDiv);

    // 2. respond to click
    element[0].addEventListener('click', function() {
      if (!controlEl.disabled) {
        var acDivInput = acDiv.querySelector('input');
        acDivInput.disabled = controlEl.disabled;
        acDiv.style.display = 'inline-block';
        acDivInput.focus();
      }
    });

    $compile(element.contents())(scope);

  }; // compileFunc

  angular.module('angularjs-autocomplete').
    directive('autoCompleteMulti', ['$compile', function(_$compile_) {
      $compile = _$compile_;
      return { link: linkFunc };
    }]);
})();
