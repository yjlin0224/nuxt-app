<script setup lang="ts">
import is from '@sindresorhus/is'
import * as jdenticon from 'jdenticon'
import { ref, watch } from 'vue'

type IdentityIconProps = {
  identity?: string
}

const props = withDefaults(defineProps<IdentityIconProps>(), {
  identity: '',
})

const svgRef = ref<SVGElement | null>(null)

watch(
  () => [props.identity, svgRef.value] as const,
  ([identity, svgRef]) => {
    // FIXME: need is.element or is.svgElement
    if (!is.string(identity) || !is.object(svgRef)) return
    jdenticon.update(svgRef, identity)
  },
  { immediate: true },
)
</script>

<template>
  <svg ref="svgRef" class="identity-icon" />
</template>
