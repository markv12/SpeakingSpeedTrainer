let lines = [];
const LINE_SEPARATOR = "_____LINE_SEPARATOR_____";

function StartReading(){
  let text_to_speak_box = document.getElementById("text_to_speak");
  let text_lines = text_to_speak_box.value.split(/\r?\n/);
  let words = [];
  let word_count = 0;
  text_lines.forEach(function(text_line){
    if(!isEmptyOrSpaces(text_line)){
      let line_words = text_line.split(/\s+/);
      words = words.concat(line_words);
      word_count += line_words.length;
      words.push(LINE_SEPARATOR);
    }
  });
  words.pop(); //Remove last LINE_SEPARATOR

  let wpm_field = document.getElementById("wpm");
  let msPerWord = 60000.0/wpm.value;
  let total_char_count = GetCharCount(words);
  let totalMS = msPerWord * word_count;
  let msPerChar = totalMS / total_char_count;

  ShowInfo(word_count, totalMS);

  let reading_words_area = document.getElementById("reading_words");
  while (reading_words_area.firstChild) {
    reading_words_area.removeChild(reading_words_area.firstChild);
  }
  let lineTags = [];
  words.forEach(function(word){
    if(word == LINE_SEPARATOR){
      lineTags.push(AddNewLine(null, reading_words_area));
    } else {
      let current_line = lineTags[lineTags.length-1];
      if(current_line){
        let oldHTML = current_line.innerHTML;
        current_line.innerHTML += word + " ";
        if(current_line.offsetWidth >= 750){
          current_line.innerHTML = oldHTML;
          lineTags.push(AddNewLine(word, reading_words_area));
        }
      } else {
        lineTags.push(AddNewLine(word, reading_words_area));
      }
    }
  });
  lines = lineTags.map(function(line_tag){
    let lineTagRect = line_tag.getBoundingClientRect();
    let lineCharCount = line_tag.innerHTML.length;
    let highlightTag = AddLineHighlight(lineTagRect.left, reading_words_area);
    return {
      line_tag : line_tag,
      highlightTag : highlightTag,
      width : (lineTagRect.right - lineTagRect.left),
      center : (lineTagRect.top + lineTagRect.bottom)/2,
      duration : msPerChar *  lineCharCount
    }
  });
  StartRead();
}

function AddNewLine(word, parent){
  let new_line = document.createElement("div");
  new_line.classList.add("read_line");
  if(word !== null){
    new_line.innerHTML = word + " ";
  }
  parent.appendChild(new_line);
  parent.appendChild(document.createElement("br"));
  return new_line;
}

function AddLineHighlight(left, parent){
  let newHighlight = document.createElement("div");
  newHighlight.classList.add("read_highlight");
  parent.appendChild(newHighlight);
  return newHighlight;
}

function StartRead(){
  lineIndex = 0;
  window.requestAnimationFrame(ReadUpdate);
}

let lastRender = 0;
let msSinceLastLine = 0;
let lineIndex = 0;
function ReadUpdate(timestamp) {
  if(lineIndex < lines.length){
    let deltaTime = timestamp - lastRender;
    if(deltaTime < 100){
      msSinceLastLine += deltaTime;
      let currentLine = lines[lineIndex];
      if(msSinceLastLine >= currentLine.duration){
        currentLine.highlightTag.style.width = currentLine.width +'px';
        msSinceLastLine -= currentLine.duration;
        lineIndex++;
      } else {
        let progress = msSinceLastLine/currentLine.duration;
        currentLine.highlightTag.style.top = (currentLine.center - 8) +'px';
        let width = lerp(0, currentLine.width, progress);
        currentLine.highlightTag.style.width = width +'px';
      }
    }

    lastRender = timestamp;
    window.requestAnimationFrame(ReadUpdate);
  }
}

function ShowInfo(word_count, totalMS){
  let totalSeconds = totalMS/1000.0;
  let totalMinutes = Math.floor(totalSeconds/60.0);
  let remainingSeconds = Math.round(totalSeconds - (totalMinutes * 60));
  if(remainingSeconds < 10){
    remainingSeconds = "0" + remainingSeconds.toString();
  }
  let text_info_tag = document.getElementById("text_info");
  text_info_tag.innerHTML = "Word Count: " + word_count + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Time: " + totalMinutes + ":" + remainingSeconds;
}

function GetCharCount(_words){
  let result = 0;
  _words.forEach(function(word){
    if(word != LINE_SEPARATOR){
      result += word.length + 1;
    }
  });
  return result;
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}