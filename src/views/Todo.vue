<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs, watch } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)

let list = ref(JSON.parse(localStorage.getItem('list')) || [])
let added = ref(JSON.parse(localStorage.getItem('added')) || [])
let edited = ref(JSON.parse(localStorage.getItem('edited')) || [])
let removed = ref(JSON.parse(localStorage.getItem('removed')) || [])
let input = ref("")

onMounted(() => {
  if (session) {
    if (added.value.length !== 0 || edited.value.length !== 0 || removed.value.length !== 0) {
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

watch(edited, () => {
  updateLocalStorage()
}, { deep: true })

watch(removed, () => {
  updateLocalStorage()
}, { deep: true })


async function pushEdits() {
    console.log("pushing")
  try {
    if (added.value.length > 0) {
      const { error: addError } = await supabase.from('todos').insert(added.value)
      if (addError) {
        console.log("Error adding tasks:", addError)
      }
    }

    if (removed.value.length > 0) {
      const { error: removeError } = await supabase.from('todos').delete().in('id', removed.value)
      if (removeError) {
        console.log("Error removing tasks:", removeError)
      }
    }

    added.value = []
    edited.value = []
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
      .select('id, task, is_complete')
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
  added.value.push(newTask)
  await pushEdits()
  input.value = ""
}

function remove(index) {
  const task = list.value.splice(index, 1)[0]
  removed.value.push(task.id)
  updateLocalStorage()
}

function updateLocalStorage() {
  localStorage.setItem('list', JSON.stringify(list.value))
  localStorage.setItem('added', JSON.stringify(added.value))
  localStorage.setItem('edited', JSON.stringify(edited.value))
  localStorage.setItem('removed', JSON.stringify(removed.value))
}

</script>

<template>
  <input type="text" v-model="input">
  <button @click="add">Add</button>
  <ul>
    <li v-for="(item, index) in list" :key="item.id">
      <input type="checkbox" v-model="item.is_complete">
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
