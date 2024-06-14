<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)
let list = ref([])
let edits = []
let input = ref("")

onMounted(() => {
    getlist()
})

async function getlist() {
    try {
        const { user } = session.value
        const { data, error, status } = await supabase
            .from('todos')
            .select('task, is_complete')
            .eq('user_id', user.id)
        if (error && status !== 406) throw error
        if (data) {
            list.value = [...data , ...list.value]
        }
    }
    catch (error) {
    alert(error.message)
  }
}
async function add() {
    // TODO !!
    // implement an edit list from the other project
    // move all the sync stuff to a btn to test it
    // priorities user experience. the app is not an extention of the server
    // HOW TO IMPLEMENT
    // list and edits will be stored in localstorage and the rest is easy
    const { user } = session.value
    if (input.value ==="") {
        return
    }
    list.value.push({
        task:input.value,
        is_complete:false
    })
    const { error } = await supabase
    .from('todos')
    .insert({
        user_id:user,
        task:input.value,
        is_complete:false
    })

}


</script>

<template>
    <input type="text" name="" id="input" v-model="input"> <button @click="add">add</button>
    <ul>
        <li v-for="item in list">
            <input type="checkbox" :checked="item.is_complete"> ->
            <span v-text="item.task"></span>
            <span class="delete">❌</span>
        </li>
    </ul>
</template>

<style>
    .delete {
        cursor: pointer;
    }
</style>