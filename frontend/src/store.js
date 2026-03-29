import { create } from 'zustand';
import { reorderLists, reorderCards } from './api';

const useStore = create((set, get) => ({
  boards: [],          
  activeBoard: null,   

  setBoards: (newBoards) => set({ boards: newBoards }),
  setActiveBoard: (boardData) => set({ activeBoard: boardData }),

  addListToActiveBoard: (newList) => set((state) => {
    if (!state.activeBoard) return state;
    return { activeBoard: { ...state.activeBoard, lists: [...state.activeBoard.lists, newList] } };
  }),

  addCardToList: (newCard, listId) => set((state) => {
    if (!state.activeBoard) return state;
    const updatedLists = state.activeBoard.lists.map(list => {
      if (list.id === listId) {
        return { ...list, cards: [...list.cards, newCard] };
      }
      return list;
    });
    return { activeBoard: { ...state.activeBoard, lists: updatedLists } };
  }),

  updateCardInStore: (listId, cardId, updatedCardPayload) => set((state) => {
    if (!state.activeBoard) return state;
    const updatedLists = state.activeBoard.lists.map(list => {
      if (list.id === listId) {
        const newCards = list.cards.map(c => 
          c.id === cardId ? { ...c, ...updatedCardPayload } : c
        );
        return { ...list, cards: newCards };
      }
      return list;
    });
    return { activeBoard: { ...state.activeBoard, lists: updatedLists } };
  }),

  removeCardFromStore: (listId, cardId) => set((state) => {
    if (!state.activeBoard) return state;
    const updatedLists = state.activeBoard.lists.map(list => {
      if (list.id === listId) {
        return { ...list, cards: list.cards.filter(c => c.id !== cardId) };
      }
      return list;
    });
    return { activeBoard: { ...state.activeBoard, lists: updatedLists } };
  }),

  updateListInStore: (listId, updatedListPayload) => set((state) => {
    if (!state.activeBoard) return state;
    const updatedLists = state.activeBoard.lists.map(list => 
      list.id === listId ? { ...list, ...updatedListPayload } : list
    );
    return { activeBoard: { ...state.activeBoard, lists: updatedLists } };
  }),

  removeListFromActiveBoard: (listId) => set((state) => {
    if (!state.activeBoard) return state;
    return {
      activeBoard: {
        ...state.activeBoard,
        lists: state.activeBoard.lists.filter(l => l.id !== listId)
      }
    };
  }),

  addBoard: (newBoard) => set((state) => ({
    boards: [...state.boards, newBoard]
  })),

  removeBoard: (boardId) => set((state) => ({
    boards: state.boards.filter(b => b.id !== boardId)
  })),

  // -- DRAG AND DROP HANDLERS --
  
  // Reorder a horizontal list column
  moveList: async (sourceIndex, destinationIndex) => {
    set((state) => {
      if (!state.activeBoard) return state;
      
      const newLists = Array.from(state.activeBoard.lists);
      const [draggedList] = newLists.splice(sourceIndex, 1);
      newLists.splice(destinationIndex, 0, draggedList);

      return {
        activeBoard: {
          ...state.activeBoard,
          lists: newLists
        }
      };
    });

    // Fire off backend sync
    const state = get();
    if (state.activeBoard) {
       const items = state.activeBoard.lists.map((l, index) => ({ id: l.id, order: index }));
       reorderLists(items).catch(console.error);
    }
  },

  // Reorder cards inside a list or move them across different lists!
  moveCard: async (sourceListId, destinationListId, sourceIndex, destinationIndex) => {
    set((state) => {
      if (!state.activeBoard) return state;

      const sourceList = state.activeBoard.lists.find(l => l.id === sourceListId);
      const destList = state.activeBoard.lists.find(l => l.id === destinationListId);

      if (!sourceList || !destList) return state;

      const updatedLists = state.activeBoard.lists.map(list => {
        // Clone cards to avoid mutating state directly
        if (list.id === sourceListId && sourceListId === destinationListId) {
          const newCards = Array.from(sourceList.cards);
          const [draggedCard] = newCards.splice(sourceIndex, 1);
          newCards.splice(destinationIndex, 0, draggedCard);
          return { ...list, cards: newCards };
        }
        
        if (list.id === sourceListId && sourceListId !== destinationListId) {
           const newCards = Array.from(sourceList.cards);
           newCards.splice(sourceIndex, 1);
           return { ...list, cards: newCards };
        }

        if (list.id === destinationListId && sourceListId !== destinationListId) {
           const destCards = Array.from(destList.cards);
           const sourceCards = Array.from(sourceList.cards);
           const draggedCard = sourceCards[sourceIndex];
           destCards.splice(destinationIndex, 0, draggedCard);
           return { ...list, cards: destCards };
        }

        return list;
      });

      return { activeBoard: { ...state.activeBoard, lists: updatedLists } };
    });

    // Fire off backend sync
    const state = get();
    if (state.activeBoard) {
       let itemsToUpdate = [];
       const sList = state.activeBoard.lists.find(l => l.id === sourceListId);
       const dList = state.activeBoard.lists.find(l => l.id === destinationListId);
       
       if (sList) {
          itemsToUpdate.push(...sList.cards.map((c, idx) => ({ id: c.id, order: idx, listId: sList.id })));
       }
       // If moved to a different list, also sync the destination list
       if (dList && sourceListId !== destinationListId) {
          itemsToUpdate.push(...dList.cards.map((c, idx) => ({ id: c.id, order: idx, listId: dList.id })));
       }
       
       if (itemsToUpdate.length > 0) {
          reorderCards(itemsToUpdate).catch(console.error);
       }
    }
  },

}));

export default useStore;
