<script setup>
import { supabase } from '../supabase'
import { onMounted, ref, toRefs } from 'vue'

const props = defineProps(['session'])
const { session } = toRefs(props)

let list = ref(JSON.parse(localStorage.getItem('list')) || [])
let edits = JSON.parse(localStorage.getItem('edits')) || []
let input = ref("")

function handle(edits) {
    if (edits.length !== 0) {
        push(edits)
    }

}



onMounted(() => {
    handle(edits)
    getlist()
})
async function push(edits) {
    console.log(session.value)
    try {
        const { error } = await supabase
        .from('todos')
        .insert(edits)
        if (error) {
            console.log("error in queris")
        }
        edits = []
        update()
    }
    catch (error) { console.log(error.message) }
}

async function getlist() {
    try {
        console.log(session.value)
        const { user } = session.value
        const { data, error, status } = await supabase
            .from('todos')
            .select('task, is_complete')
            .eq('user_id', user.id)
        if (error && status !== 406) throw error
        if (data) {
            data.forEach(element => {
                const index = list.value.findIndex( (l) => l.task === element.task)
                if (index === -1) {
                    list.value.push(element)
                }
                else {
                    list.value[index].is_complete = element.is_complete
                }
            });
            //list.value = [...data, ...list.value]
        }
    }
    catch (error) {
        console.log(error.message)
    }
    update()
}
async function add() {
    // TODO !!
    // implement an edit list from the other project
    // move all the sync stuff to a btn to test it
    // priorities user experience. the app is not an extention of the server
    // HOW TO IMPLEMENT
    // list and edits will be stored in localstorage and the rest is easy
    const { user } = session.value
    if (input.length < 3) {
        return
    }
    list.value.push({
        task: input.value,
        is_complete: false
    })
    edits.push({
        user_id: user.id,
        task: input.value,
        is_complete: false,
    })
    update()
}
function update() {
    localStorage.setItem('list', JSON.stringify(list.value))
    localStorage.setItem('edits', JSON.stringify(edits))
}


</script>

<template>
    <input type="text" name="" id="input" v-model="input"> <button @click="add">add</button>
    <ul>
        <li v-for="item in list">
            <input type="checkbox" :checked="item.is_complete">
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