import { FC } from 'react';
import classNames from 'classnames/bind';
import style from './style/index.module.scss';
import Icon from '@/components/Icon';
import Dropdown from '@/components/Dropdown';
import { dropdownItems } from '@/config/config';
import Whether from '@/components/Whether';
import { useModalStore } from '@/store/modal';
import { useChatSessionStore } from '@/store/chat';

const cn = classNames.bind(style);
interface ChatItemProps {
  text: string;
  id: number;
  chatId: string;
  prefix?: string;
  collapse?: boolean;
  checked?: boolean;
  onClick?: () => void;
}
const ChatItem: FC<ChatItemProps> = (props) => {
  const { text, prefix, collapse, checked } = props;
  const { chatList } = useChatSessionStore((state) => state);
  const { setRoleAction, setRoleModalInfo, toggleRoleModal } = useModalStore((state) => state);
  const dropdownItemClickHandler = (key: string) => {
    if (key === 'edit') {
      const roleInfo = chatList.find((item) => item.chatId === props.chatId);
      console.log(roleInfo);
      setRoleModalInfo({
        id: props.id,
        name: roleInfo?.name || '',
        description: roleInfo?.description || '',
        avatarName: roleInfo?.avatarName || '',
      });
      setRoleAction('edit');
      toggleRoleModal(true);
    }
  };
  return (
    <div className={cn('chat-item', { 'chat-item__collapse': collapse, 'chat-item__checked': checked })}>
      <div className={cn('chat-item__left', 'flex items-center flex-1')} onClick={props.onClick}>
        <img className={cn('chat-item__prefix')} src={prefix}></img>
        <span className="inline-block text-ellipsis overflow-hidden whitespace-nowrap">{text}</span>
      </div>
      <Whether condition={!collapse}>
        <Dropdown items={dropdownItems} itemOnClick={dropdownItemClickHandler}>
          <div className="mx-[12px]">
            <Icon name="more-line" color="var(--assist-color)" />
          </div>
        </Dropdown>
      </Whether>
    </div>
  );
};

export default ChatItem;
