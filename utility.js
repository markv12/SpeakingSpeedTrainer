function isEmptyOrSpaces(str){
  return str === null || str === undefined || str === "" || str.match(/^ *$/) !== null;
}