<template>
  <div class="Taggable-Input">
    <span
      contenteditable="true"
      class="dmv-min-height leading-loose w-full block bg-gray-200 appearance-none border border-gray-400 rounded w-full py-2 px-2 text-gray-800 leading-tight focus:outline-none focus:bg-gray-400 focus:border-gray-500"
      v-html="getContent"
      @keyup="setContent"
      @focus="changeFocus(true)"
      @blur="changeFocus(false)"
      @click="setLastKeywordWritten"
      @keydown="removeTagIdentifier"
      @keydown.space="setTriggerWord"
      @keydown.delete="backspaceTriggered"
      @keydown.enter.stop.prevent="pressEnter"
      ref="input"
    ></span>
    <!--<p>{{text}}</p>
    <p>KEYWORD: {{lastKeyword}}</p>
    <p>KEYWORD written: {{lastKeywordWritten}}</p>
    <p>CURSOR: {{cursor}}</p>
    <p>matchedword trigger: {{matchedWordTriggered}}</p>
    <p>triggeredword: {{triggeredWord}}</p>
    <p>PURE: {{pure}}</p>-->
  </div>
</template>

<script>
export default {
  name: "TodoistTaggableInput",
  data: function() {
    return {
      text: "",
      phrase: 2,
      lastKeyword: "",
      lastKeywordWritten: "",
      cursor: 0,
      focus: false,
      matchedWordTriggered: false,
      triggeredWord: "",
      keywordArray: [],
      pureWithoutKeyword: "",
      date: ""
    };
  },
  methods: {
    transformToTag: function(val) {
      return '<span class="tag">' + val + "</span>";
    },

    renderContentEditable: function() {
      var el = this.$refs.input;
      this.text = el.innerHTML;
    },

    getCaretPosition: function() {
      // get caret position of cursor
      var caretOffset = 0;
      var w3 = typeof window.getSelection !== "undefined" && true;
      var element = this.$refs.input;
      if (w3) {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      } else {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
      }
      return caretOffset;
    },

    setCaretPosition: function(el, pos) {
      // set caret position of cursor
      // can be used for clicking inside content editable input
      for (var node of el.childNodes) {
        if (node.nodeType === 3) {
          // we have a text node
          if (node.length >= pos) {
            // finally add our range
            var range = document.createRange(),
              sel = window.getSelection();
            range.setStart(node, pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return -1; // we are done
          } else {
            pos -= node.length;
          }
        } else {
          pos = this.setCaretPosition(node, pos);
          if (pos === -1) {
            return -1; // no need to finish the for loop
          }
        }
      }
      return pos; // needed because of recursion stuff
    },

    setCaret: function(val = null) {
      // forwarder to setCaretPosition method
      if (val == null) {
        val = this.cursor;
      }
      var el = this.$refs.input;
      this.setCaretPosition(el, val);
    },

    pressEnter: function() {
      // keypress enter is prevented.
    },

    setContent: function() {
      //set content of input
      this.cursor = this.getCaretPosition();
      this.renderContentEditable();
      this.setLastKeyword();
    },

    setLastKeyword: function() {
      //set lastKeyword to state
      let words = this.pure.split(" ").filter(item => item);
      this.lastKeyword = words[words.length - 1];
    },
    setLastKeywordWritten: function() {
      // set last written keyboard according to caret position
      this.cursor = this.getCaretPosition();
      let writtenToCursor = this.pure.slice(0, this.cursor);
      let words = writtenToCursor.split(" ").filter(item => item);
      this.lastKeywordWritten = words[words.length - 1];
    },

    changeFocus: function(focusBool) {
      // set state of focus if needed
      this.focus = focusBool;
    },

    setTriggerWord: function(event) {
      // if space triggered this method will work
      // set triggered word if word is our special date keywords
      // otherwise add space to input
      //let el = this.$refs.input;
      if (this.matchedWordTriggered === true) {
        this.triggeredWord = this.lastKeywordWritten.replace(/\s/g, "");
        event.preventDefault();

        const item = this.getKeywordDate(this.triggeredWord)[0];
        this.date = item.date.format("L");

        this.text = this.splitSpan();
        let newCursor = this.cursor + 1;
        this.cursor = newCursor;
        this.setCaret(newCursor);
      }
      /*else if (
        navigator.userAgent.toLowerCase().indexOf("firefox") > -1 &&
        this.matchedWordTriggered === false
      ) {
        event.preventDefault();
        let input =
          this.text.slice(0, this.cursor) +
          "&thinsp;" +
          this.text.slice(this.cursor);
        //this.text = input;
        this.text = el.innerHTML + "&thinsp;";
        let newCursor = this.cursor + 1;
        this.cursor = newCursor;
        this.setCaret(newCursor);
      }
      */
    },

    getKeywordDate: function(keyword) {
      // get date value of triggered keyword
      return this.keywords.filter(item => item.name === keyword);
    },

    setInput: function(pure, val, cursor) {
      // set input & render if any html will be added
      let input = pure.slice(0, cursor - val.length);
      input += this.transformToTag(val);
      input += pure.slice(cursor);
      return input;
    },

    backspaceTriggered: function() {
      // trigger method for backspace
      this.removeTagIdentifier();
    },

    removeTagIdentifier: function() {
      // TODO - Description
      let htmlKeyword = this.transformToTag(this.triggeredWord);
      var el = this.$refs.input;
      if (
        el.innerHTML.indexOf(htmlKeyword) == -1 &&
        this.matchedWordTriggered == false
      ) {
        var src = el.textContent;
        this.text = src;
      }
    },

    checkKeyword: function(val) {
      // if listed keywords contains our latest written keyword
      let found = false;
      this.keywords.forEach(function(a) {
        if (a.name === val) {
          found = true;
        }
      });
      return found;
    },

    splitSpan: function() {
      let el = this.$refs.input;
      const words = el.innerHTML.split("</span>");
      return words[0] + "</span>&thinsp;" + words[1];
      //insertBrOnReturn
    },

    getDateByKeyword: function(keyword){
      return (this.$moment().day(keyword) < this.$moment()) ? this.$moment().day(keyword+7) : this.$moment().day(keyword);
    }
  },

  computed: {
    pure: function() {
      // clear all html from input
      return this.text.replace(/<\/?[^>]+>/gi, "");
    },
    getContent: function() {
      return this.text;
    },

    keywords: function() {
      // magic keywords
      let array = [
        {
          name: "tod",
          date: this.$moment()
        },
        {
          name: "today",
          date: this.$moment()
        },
        {
          name: "tom",
          date: this.$moment().add("1", "d")
        },
        {
          name: "tomorrow",
          date: this.$moment().add("1", "d")
        },
        {
          name: "nextweek",
          date: this.$moment().add("1", "w")
        },
        {
          name: "monday",
          date: this.getDateByKeyword(1)
        },
        {
          name: "mon",
          date: this.getDateByKeyword(1)
        },
        {
          name: "tuesday",
          date: this.getDateByKeyword(2)
        },
        {
          name: "tue",
          date: this.getDateByKeyword(2)
        },
        {
          name: "wednesday",
          date: this.getDateByKeyword(3)
        },
        {
          name: "wed",
          date: this.getDateByKeyword(3)
        },
        {
          name: "thursday",
          date: this.getDateByKeyword(4)
        },
        {
          name: "thu",
          date: this.getDateByKeyword(4)
        },
        {
          name: "friday",
          date: this.getDateByKeyword(5)
        },
        {
          name: "fri",
          date: this.getDateByKeyword(5)
        },
        {
          name: "saturday",
          date: this.getDateByKeyword(6)
        },
        {
          name: "sat",
          date: this.getDateByKeyword(6)
        },
        {
          name: "sunday",
          date: this.getDateByKeyword(0)
        },
        {
          name: "sun",
          date: this.getDateByKeyword(0)
        },
      ];
      return array;
    }
  },
  watch: {
    text: function() {
      var el = this.$refs.input;
      var re = /<([^( |>)]+)([^>]*)>.*?<\/\1>|<.*?\/>/g;
      this.pureWithoutKeyword = el.innerHTML.replace(re, "");
    },

    pure: function() {
      this.setLastKeyword();
      this.setLastKeywordWritten();
    },

    lastKeywordWritten: function(val) {
      const keywordBool = this.checkKeyword(val);

      if (keywordBool === true) {
        this.matchedWordTriggered = true;
        let input = this.setInput(this.pure, val, this.cursor);
        this.text = input;
      } else {
        this.matchedWordTriggered = false;
      }
    }
  },

  updated() {
    this.removeTagIdentifier();
    let writtenPlusSpace = this.lastKeywordWritten + "&thinsp;";
    if (this.focus === true && writtenPlusSpace !== this.lastKeyword) {
      this.setCaret();
    } else {
      this.setCaret(this.cursor + 1);
    }
    this.$emit("pure-data", this.pureWithoutKeyword);
    this.$emit("date", this.date);
  }
};
</script>

<style>
.content-editable {
  margin: 8px 0;
  padding: 5px;
  border: 1px solid #333;
  width: 100%;
  line-height: 14px;
  min-height: 16px;
  white-space: pre-wrap;
  white-space: -moz-pre-wrap !important;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  display: inline-block;
}

.tag {
  background-color: rgb(255, 0, 0, 0.4);
  padding: 2px 5px;
  border-radius: 2px;
}

.dmv-min-height{
  min-height: 3rem;
}
</style>
