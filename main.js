let words = [];
let word_tags = [];
let read_cursor = null;

function StartReading(){
  read_cursor = document.getElementById("read_cursor");
  let text_to_speak_box = document.getElementById("text_to_speak");
  words = text_to_speak_box.value.split(/\s+/);
  let wpm_field = document.getElementById("wpm");
  let msPerWord = 60000.0/wpm.value;
  let word_count = words.length;
  let char_count = GetCharCount(words);
  let totalMS = msPerWord * word_count;
  msPerChar = totalMS / char_count;

  let reading_words_area = document.getElementById("reading_words");
  while (reading_words_area.firstChild) {
    reading_words_area.removeChild(reading_words_area.firstChild);
  }
  word_tags = [];
  words.forEach(function(word){
    let word_tag = document.createElement("div");
    word_tag.classList.add("word_tag");
    word_tag.innerHTML = word;
    reading_words_area.appendChild(word_tag);
    console.log(word_tag.offsetWidth);
    word_tags.push(word_tag);
  });
  StartRead();
}

function StartRead(){
  wordIndex = 0;
  GoToNextWord();
  window.requestAnimationFrame(ReadUpdate);
}

let lastRender = 0;
let msSinceLastWord = 0;
let msPerChar = 0.0;
let wordIndex = 0;
function ReadUpdate(timestamp) {
  if(wordIndex < words.length){
    let deltaTime = timestamp - lastRender;
    if(deltaTime < 100){
      msSinceLastWord += deltaTime;
      let msForWord = msPerChar * words[wordIndex-1].length;
      //console.log("per word: " + msForWord + " the word: " + words[wordIndex-1]);
      if(msSinceLastWord >= msForWord){
        msSinceLastWord -= msForWord;
        GoToNextWord();
      }
    }

    lastRender = timestamp;
    window.requestAnimationFrame(ReadUpdate);
  }
}

function GoToNextWord(){
  if(wordIndex > 0){
    let prevWordTag = word_tags[wordIndex-1];
    prevWordTag.classList.remove("selected_word_tag");
  }
  let wordTag = word_tags[wordIndex];
  //wordTag.classList.add("selected_word_tag");

  let wordTagRect = wordTag.getBoundingClientRect();
  read_cursor.style.left = wordTagRect.left +'px';
  read_cursor.style.top = wordTagRect.top +'px';
  //console.log("this word shown: " + wordTag.innerHTML);
  wordIndex++;
}

function GetCharCount(words){
  let result = 0;
  words.forEach(function(word){
    result += word.length;
  });
  return result;
}