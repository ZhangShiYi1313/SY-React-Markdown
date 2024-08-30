import LoadingIcon from './icons/three-dots.svg';
import BotIcon from './icons/bot.svg';
import styles from './loading.module.scss';

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles['loading-content'] + ' no-dark'}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
