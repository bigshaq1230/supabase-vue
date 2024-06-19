<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)
let list = ref([])
let added = ref([])
let removed = ref([])

// questinable solution but it is what it is
// 🤓🤓🤓🤓🤓🤓🤓🤓🤓🤓🤓
watch(session, () => {
  if (session.value) {
    getList()
    if (added.value.length !== 0 || removed.value.length !== 0) {
      pushEdits()
      getList()
    }
  }
  else {
    console.log("here")
    added.value = JSON.parse(localStorage.getItem('added')) || []
    removed.value = JSON.parse(localStorage.getItem('removed')) || []
  }
}, { deep: true })

list.value = JSON.parse(localStorage.getItem('list')) || []
watch([list, added, removed], () => {
  updateLocalStorage()
}, { deep: true })
let input = ref("")




async function pushEdits() {
  console.log("pushing")
  try {
    if (added.value.length > 0) {
      const { data, error: addError } = await supabase.from('todos').upsert(...added.value)
      if (addError) {
        console.log("Error adding tasks:", addError)
      }
    }
    added.value = []

    if (removed.value.length > 0) {
      const { error: removeError } = await supabase.from('todos').delete().in('id', ...removed.value)
      if (removeError) {
        console.log("Error removing tasks:", removeError)
      }
    }

    removed.value = []
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
  if (session.value) {
    const { user } = session.value
    const newTask = { user_id: user.id, task: input.value, is_complete: false }
    list.value.push(newTask)
    const { data, error: addError } = await supabase.from('todos').upsert(newTask).select()
    list.value[(list.value.length) - 1] = data[0]
  }
  else {
    const newTask = { task: input.value, is_complete: false }
    list.value.push(newTask)
    added.value.push(newTask)
  }
  input.value = ""
}

async function remove(index) {
  console.log(index)
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
  else {
    added.value.push(list.value[index])
  }
}

function updateLocalStorage() {
  console.log("updating local storage")
  localStorage.setItem('list', JSON.stringify(list.value))
  localStorage.setItem('added', JSON.stringify(added.value))
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