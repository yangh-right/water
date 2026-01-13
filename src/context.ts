import { computed, reactive } from "@vue/composition-api";
import { createContext } from "./utils/composition";

export enum EntrenceType {
  TOOLBAR = 'TOOLBAR',
  MICRO_APP = 'MICRO_APP',
  SINGLE = 'SINGLE'
}

export const appContext = createContext((entrenceType: EntrenceType) => {

  const state = reactive({
    entrenceType,
    isMicroApp: computed((): boolean => state.entrenceType === EntrenceType.MICRO_APP),
    isSigle: computed((): boolean => state.entrenceType === EntrenceType.SINGLE),
    isToolbar: computed((): boolean => state.entrenceType === EntrenceType.TOOLBAR)
  })
	return state
})

type appContext = ReturnType<typeof appContext.inject>;

