/**
 * Base64 Encoder
 * 
 * @see `gherkin/formatter/json_formatter`
 * @param {string} input File data
 * @returns {string} Base64-encoded file
 */
function base64encode(input) {
    var swaps = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];
    var input_binary = "";
    var output = "";
    var temp_binary;
    var index;
    for (index=0; index < input.length; index++) {
        temp_binary = input.charCodeAt(index).toString(2);
        while (temp_binary.length < 8) {
            temp_binary = "0"+temp_binary;
        }
        input_binary = input_binary + temp_binary;
        while (input_binary.length >= 6) {
            output = output + swaps[parseInt(input_binary.substring(0,6),2)];
            input_binary = input_binary.substring(6);
        }
    }
    if (input_binary.length === 4) {
        temp_binary = input_binary + "00";
        output = output + swaps[parseInt(temp_binary,2)];
        output = output + "=";
    }
    if (input_binary.length === 2) {
        temp_binary = input_binary + "0000";
        output = output + swaps[parseInt(temp_binary,2)];
        output = output + "==";
    }
    return output;
}
