<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)
let list = ref([])
let removed = ref([])
let changed = ref(false)

list.value = JSON.parse(localStorage.getItem('list')) || []
removed.value = JSON.parse(localStorage.getItem('removed')) || []

changed.value = JSON.parse(localStorage.getItem('state')) || false

watch(session, async() => {
  if (session.value) {
      await pushEdits()
      getList()
    }
  else {
    console.log("user not logged in")
  }
}, { deep: true })

watch([list, removed,changed], () => {
  updateLocalStorage()
}, { deep: true })
let input = ref("")




async function pushEdits() {
  try {
    if (changed.value) {
      const { user } = session.value
      let id = user.id
      for (i=0;i<list.value.length;i++) {
        list.value[i].user_id = id
      }
      console.log(list.value)
      const { data, error: addError } = await supabase.from('todos').upsert(...list.value)
      if (addError) {
        console.log("Error adding tasks:", addError)
      }
      else changed.value = false
    }

    if (removed.value.length > 0) {
      const { error: removeError } = await supabase.from('todos').delete().in('id', ...removed.value)
      if (removeError) {
        console.log("Error removing tasks:", removeError)
      }
      else removed.value = []
    }

  } catch (error) {
    console.log("Catch error:", error.message)
  }
}

async function getList() {
  console.log("pulling")
  try {
    const { user } = session.value
    const { data, error, status } = await supabase
      .from('todos')
      .select()
      .eq('user_id', user.id)
    if (error && status !== 406) throw error
    if (data) {
      list.value = data
      console.log(data)
    }
  } catch (error) {
    console.log("Get list error:", error.message)
  }
}

async function add() {
  if (input.value.length < 3) {
    return
  }
  const newTask = { task: input.value, is_complete: false }
  list.value.push(newTask)

  if (session.value) {
    const { user } = session.value
    newTask.user_id =  user.id
    const { data, error: addError } = await supabase.from('todos').upsert(newTask).select()
    list.value[(list.value.length) - 1] = data[0]
  }
  else changed.value = true
  console.log("the new task",newTask)
  input.value = ""
}

async function remove(index) {
  const task = list.value.splice(index, 1)[0]
  if (session.value) {
    const { error: removeError } = await supabase.from('todos').delete().eq('id', task.id)
    if (removeError) {
      console.log("Error removing tasks:", removeError)
    }
  }
  else {
    removed.value.push(task.id)
  }
}
async function edit(index) {

  list.value[index].is_complete = !list.value[index].is_complete

  if (session.value) {
    const { data, error: addError } = await supabase.from('todos').upsert(list.value[index])
    if (addError) {
      console.log("Error adding tasks:", addError)
    }
  }
  else changed.value = true
}

function updateLocalStorage() {
  console.log("updating local storage")
  localStorage.setItem('list', JSON.stringify(list.value))
  localStorage.setItem('removed', JSON.stringify(removed.value))
}

</script>

<template>
  <input type="text" v-model="input">
  <button @click="add">Add</button>
  <ul>
    <li v-for="(item, index) in list" :key="item.id">
      <input type="checkbox" v-model="item.is_complete" @click="edit(index)">
      <span :class="{ isDone: item.is_complete }">{{ item.task }} , {{ item.id }}</span>
      <span class="delete" @click="remove(index)">❌</span>
    </li>
  </ul>
</template>

<style>
.delete {
  cursor: pointer;
}

.isDone {
  text-decoration: line-through
}
</style>