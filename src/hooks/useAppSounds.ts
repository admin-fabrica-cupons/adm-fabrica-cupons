import useSound from 'use-sound';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useAppSounds = () => {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const [playClick, { stop: stopClick }] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playSuccess, { stop: stopSuccess }] = useSound('/sounds/sucess.mp3', { volume: 0.5 });
  const [playError, { stop: stopError }] = useSound('/sounds/error.mp3', { volume: 0.5 });
  const [playWarning, { stop: stopWarning }] = useSound('/sounds/notify.mp3', { volume: 0.5 });
  const [playPopOn, { stop: stopPopOn }] = useSound('/sounds/pop-up.mp3', { volume: 0.5 });
  const [playPopOff, { stop: stopPopOff }] = useSound('/sounds/whoosh.mp3', { volume: 0.5 });
  const [playDelete, { stop: stopDelete }] = useSound('/sounds/whoosh.mp3', { volume: 0.5 });
  const [playAdd, { stop: stopAdd }] = useSound('/sounds/add-block.mp3', { volume: 0.2 });
  const [playNotification, { stop: stopNotification }] = useSound('/sounds/modern-notification.mp3', { volume: 0.5 });
  const [playMessageSent, { stop: stopMessageSent }] = useSound('/sounds/send-chat.mp3', { volume: 0.5 });
  const [playMessageReceived, { stop: stopMessageReceived }] = useSound('/sounds/receive.mp3', { volume: 0.5 });
  const [playLoading, { stop: stopLoading }] = useSound('/sounds/pop-up.mp3', { volume: 0.2 });
  const [playChatOpen, { stop: stopChatOpen }] = useSound('/sounds/soft-start-up.mp3', { volume: 0.7 });
  const [playChatWelcome, { stop: stopChatWelcome }] = useSound('/sounds/first-message-robot.mp3', { volume: 0.1 });
  const [playChatClose, { stop: stopChatClose }] = useSound('/sounds/chat-off.mp3', { volume: 0.5 });
  const [playWelcomeAdmin, { stop: stopWelcomeAdmin }] = useSound('/sounds/welcome_admin.mp3', { volume: 0.6 });
  const [playExitConfirm, { stop: stopExitConfirm }] = useSound('/sounds/are_you_sure.mp3', { volume: 0.6 });
  const [playExitConfirmed, { stop: stopExitConfirmed }] = useSound('/sounds/you_go.mp3', { volume: 0.6 });
  const [playNewPost, { stop: stopNewPost }] = useSound('/sounds/new_post.mp3', { volume: 0.6 });
  const [playImLu, { stop: stopImLu }] = useSound('/sounds/im_lu.mp3', { volume: 0.6 });
  const [playGoodBye, { stop: stopGoodBye }] = useSound('/sounds/good_bye.mp3', { volume: 0.6 });
  const [playAiSuccess, { stop: stopAiSuccess }] = useSound('/sounds/sucess_a.mp3', { volume: 0.6 });
  const [playAiError, { stop: stopAiError }] = useSound('/sounds/erro_bot.mp3', { volume: 0.6 });
  const [playPublishedSuccess, { stop: stopPublishedSuccess }] = useSound('/sounds/published_sucess.mp3', { volume: 0.6 });
  const [playDraftSave, { stop: stopDraftSave }] = useSound('/sounds/draft_save.mp3', { volume: 0.6 });
  const [playExitConfirmedRest, { stop: stopExitConfirmedRest }] = useSound('/sounds/good_rest.mp3', { volume: 0.6 });
  const [playExitCanceled, { stop: stopExitCanceled }] = useSound('/sounds/what_good.mp3', { volume: 0.6 });
  const [playNews, { stop: stopNews }] = useSound('/sounds/news.mp3', { volume: 0.6 });
  const [playFactsSectionOpen, { stop: stopFactsSectionOpen }] = useSound('/sounds/section_facts.mp3', { volume: 0.6 });
  const [playFactsSectionClose, { stop: stopFactsSectionClose }] = useSound('/sounds/exti_section_facts.mp3', { volume: 0.6 });
  const [playFact1, { stop: stopFact1 }] = useSound('/sounds/fact1.mp3', { volume: 0.6 });
  const [playFact2, { stop: stopFact2 }] = useSound('/sounds/fact2.mp3', { volume: 0.6 });
  const [playFact3, { stop: stopFact3 }] = useSound('/sounds/fact3.mp3', { volume: 0.6 });
  const [playBacking, { stop: stopBacking }] = useSound('/sounds/backing.mp3', { volume: 0.6 });
  const [playCategoriesSound, { stop: stopCategoriesSound }] = useSound('/sounds/categories.mp3', { volume: 0.6 });
  const [playRefreshSound, { stop: stopRefreshSound }] = useSound('/sounds/refresh.mp3', { volume: 0.6 });
  const [playSectionInitial, { stop: stopSectionInitial }] = useSound('/sounds/section_initial.mp3', { volume: 0.6 });

  const stops = useMemo(() => ([
    stopClick,
    stopSuccess,
    stopError,
    stopWarning,
    stopPopOn,
    stopPopOff,
    stopDelete,
    stopAdd,
    stopNotification,
    stopMessageSent,
    stopMessageReceived,
    stopLoading,
    stopChatOpen,
    stopChatWelcome,
    stopChatClose,
    stopWelcomeAdmin,
    stopExitConfirm,
    stopExitConfirmed,
    stopNewPost,
    stopImLu,
    stopGoodBye,
    stopAiSuccess,
    stopAiError,
    stopPublishedSuccess,
    stopDraftSave,
    stopExitConfirmedRest,
    stopExitCanceled,
    stopNews,
    stopFactsSectionOpen,
    stopFactsSectionClose,
    stopFact1,
    stopFact2,
    stopFact3,
    stopBacking,
    stopCategoriesSound,
    stopRefreshSound,
    stopSectionInitial,
  ]), [
    stopClick,
    stopSuccess,
    stopError,
    stopWarning,
    stopPopOn,
    stopPopOff,
    stopDelete,
    stopAdd,
    stopNotification,
    stopMessageSent,
    stopMessageReceived,
    stopLoading,
    stopChatOpen,
    stopChatWelcome,
    stopChatClose,
    stopWelcomeAdmin,
    stopExitConfirm,
    stopExitConfirmed,
    stopNewPost,
    stopImLu,
    stopGoodBye,
    stopAiSuccess,
    stopAiError,
    stopPublishedSuccess,
    stopDraftSave,
    stopExitConfirmedRest,
    stopExitCanceled,
    stopNews,
    stopFactsSectionOpen,
    stopFactsSectionClose,
    stopFact1,
    stopFact2,
    stopFact3,
    stopBacking,
    stopCategoriesSound,
    stopRefreshSound,
    stopSectionInitial,
  ]);

  const stopAll = useCallback(() => {
    stops.forEach(stop => stop?.());
  }, [stops]);

  const safePlayers = useMemo(() => {
    const guard = <T extends (...args: any[]) => any>(fn: T) => {
      return (...args: Parameters<T>) => {
        if (!audioUnlocked) return;
        stopAll();
        return fn(...args);
      };
    };

    return {
      playClick: guard(playClick),
      playSuccess: guard(playSuccess),
      playError: guard(playError),
      playWarning: guard(playWarning),
      playPopOn: guard(playPopOn),
      playPopOff: guard(playPopOff),
      playDelete: guard(playDelete),
      playAdd: guard(playAdd),
      playNotification: guard(playNotification),
      playMessageSent: guard(playMessageSent),
      playMessageReceived: guard(playMessageReceived),
      playLoading: guard(playLoading),
      playChatOpen: guard(playChatOpen),
      playChatWelcome: guard(playChatWelcome),
      playChatClose: guard(playChatClose),
      playWelcomeAdmin: guard(playWelcomeAdmin),
      playExitConfirm: guard(playExitConfirm),
      playExitConfirmed: guard(playExitConfirmed),
      playNewPost: guard(playNewPost),
      playImLu: guard(playImLu),
      playGoodBye: guard(playGoodBye),
      playAiSuccess: guard(playAiSuccess),
      playAiError: guard(playAiError),
      playPublishedSuccess: guard(playPublishedSuccess),
      playDraftSave: guard(playDraftSave),
      playExitConfirmedRest: guard(playExitConfirmedRest),
      playExitCanceled: guard(playExitCanceled),
      playNews: guard(playNews),
      playFactsSectionOpen: guard(playFactsSectionOpen),
      playFactsSectionClose: guard(playFactsSectionClose),
      playFact1: guard(playFact1),
      playFact2: guard(playFact2),
      playFact3: guard(playFact3),
      playBacking: guard(playBacking),
      playCategoriesSound: guard(playCategoriesSound),
      playRefreshSound: guard(playRefreshSound),
      playSectionInitial: guard(playSectionInitial),
      audioUnlocked,
    };
  }, [
    audioUnlocked,
    stopAll,
    playClick,
    playSuccess,
    playError,
    playWarning,
    playPopOn,
    playPopOff,
    playDelete,
    playAdd,
    playNotification,
    playMessageSent,
    playMessageReceived,
    playLoading,
    playChatOpen,
    playChatWelcome,
    playChatClose,
    playWelcomeAdmin,
    playExitConfirm,
    playExitConfirmed,
    playNewPost,
    playImLu,
    playGoodBye,
    playAiSuccess,
    playAiError,
    playPublishedSuccess,
    playDraftSave,
    playExitConfirmedRest,
    playExitCanceled,
    playNews,
    playFactsSectionOpen,
    playFactsSectionClose,
    playFact1,
    playFact2,
    playFact3,
    playBacking,
    playCategoriesSound,
    playRefreshSound,
    playSectionInitial,
  ]);

  return safePlayers;
};
