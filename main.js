let lines = [];
let read_cursor = null;

function StartReading(){
  read_cursor = document.getElementById("read_cursor");
  let text_to_speak_box = document.getElementById("text_to_speak");
  words = text_to_speak_box.value.split(/\s+/);
  let wpm_field = document.getElementById("wpm");
  let msPerWord = 60000.0/wpm.value;
  let word_count = words.length;
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
  });
  lines = lineTags.map(function(line_tag){
    let lineTagRect = line_tag.getBoundingClientRect();
    let lineCharCount = line_tag.innerHTML.length;
    return {
      line_tag : line_tag,
      left : lineTagRect.left,
      right : lineTagRect.right,
      center : (lineTagRect.top + lineTagRect.bottom)/2,
      duration : msPerChar *  lineCharCount
    }
  });
  StartRead();
}

function AddNewLine(word, parent){
  let new_line = document.createElement("div");
  new_line.classList.add("read_line");
  new_line.innerHTML = word + " ";
  parent.appendChild(new_line);
  return new_line;
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
        msSinceLastLine -= currentLine.duration;
          lineIndex++;
      } else {
        let progress = msSinceLastLine/currentLine.duration;
        let x = lerp(currentLine.left, currentLine.right, progress);
        read_cursor.style.left = x +'px';
        read_cursor.style.top = (currentLine.center -12) +'px';
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
  let text_info_tag = document.getElementById("text_info");
  text_info_tag.innerHTML = "Word Count: " + word_count + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total Time: " + totalMinutes + ":" + remainingSeconds;
}

function GetCharCount(words){
  let result = 0;
  words.forEach(function(word){
    result += word.length + 1;
  });
  return result;
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}