<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)

let list = ref(JSON.parse(localStorage.getItem('list')) || [])
let added = ref(JSON.parse(localStorage.getItem('added')) || [])
let removed = ref(JSON.parse(localStorage.getItem('removed')) || [])
let input = ref("")

onMounted(() => {
  if (session) {
    if (added.value.length !== 0 ||  removed.value.length !== 0) {
      pushEdits()
    }
    getList()
  }
})

watch(list, () => {
  updateLocalStorage()
}, { deep: true })

watch(added, () => {
  updateLocalStorage()
}, { deep: true })


watch(removed, () => {
  updateLocalStorage()
}, { deep: true })


async function pushEdits() {
  console.log("pushing")
  try {
    if (added.value.length > 0) {
      const { data,error: addError } = await supabase.from('todos').upsert(...added.value).select()
      if (addError) {
        console.log("Error adding tasks:", addError)
      }
    }
    added.value = []

    if (removed.value.length > 0) {
      const { error: removeError } = await supabase.from('todos').delete().in('id', removed.value)
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
    }
  } catch (error) {
    console.log("Get list error:", error.message)
  }
}

async function add() {
  const { user } = session.value
  if (input.value.length < 3) {
    return
  }
  const newTask = { user_id: user.id, task: input.value, is_complete: false }
  list.value.push(newTask)
  if (session) {
    const { data,error: addError } = await supabase.from('todos').upsert(newTask).select()
    list.value[-1] = data
  }
  else {
    list.value.push(newTask)
    added.value.push(newTask)
  }
  input.value = ""
}

async function remove(index) {
  const task = list.value.splice(index, 1)[0]
  list.value.splice(index,1)
  if (session) {
    const { error: removeError } = await supabase.from('todos').delete().in('id', task.id)
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

  if (session) {
    const { data,error: addError } = await supabase.from('todos').upsert(...added.value).select()
    if (addError) {
      console.log("Error adding tasks:", addError)
    }
  }
  else {
    added.value.push(list.value[index])
  }
}

function updateLocalStorage() {
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
      <span>{{ item.task }}</span>
      <span class="delete" @click="remove(index)">❌</span>
    </li>
  </ul>
</template>

<style>
.delete {
  cursor: pointer;
}
</style>
