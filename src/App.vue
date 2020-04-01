<template>
  <div id="app" class="bg-white p-8 container mx-auto w-full lg:w-1/3">
    <form class="w-full">
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full px-3">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
            Enter your to-do
          </label>
          <TodoistTaggableInput @pure-data="setPureData" @date="setDate"/>
          <p class="text-gray-600 text-xs italic">Please use date adverbs</p>
          <p class="text-gray-600 text-xs italic">today (tod), tomorrow (tom), nexweek and day names with their abbrevations (e.g. sun for sunday) can be used.</p>
        </div>
      </div>
      <div class="md:w-2/3">
        <p class="text-gray-600 text-xs tracking-wide font-bold"><span class="uppercase">Text: </span>{{text}}</p>
        <p class="text-gray-600 text-xs tracking-wide font-bold"><span class="uppercase">Date: </span>{{date}}</p>
      </div>
    </form>
  </div>
</template>

<script>
import TodoistTaggableInput from "./components/TodoistTaggableInput";

export default {
  name: "App",
  components: {
    TodoistTaggableInput
  },
  data: function() {
    return {
      text: "",
      date: ""
    };
  },
  methods: {
    setPureData: function(value) {
      this.text = value;
    },
    setDate: function(value) {
      this.date = value;
    }
  }
};
</script>

<style>
</style>
