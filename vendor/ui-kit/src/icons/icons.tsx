/*
 * Figma "Design System" dosyasindaki 121 Iconly/Sharp/Light ikonun SVG
 * geometrisi. Otomatik uretilir; elle duzenlemeyin.
 *
 * Renkler currentColor ile degistirilmis tir; boylece ikonlar tema
 * uzerinden renklenebilir.
 */
import type { ReactNode } from 'react';

/** Ikonlarin viewBox degerleri. Varsayilan: 0 0 24 24. */
export const ICON_VIEWBOX: Record<string, string> = {
  'activity': '0 0 24 24',
  'add-user': '0 0 24 24',
  'arrow-down': '0 0 24 24',
  'arrow-down-2': '0 0 24 24',
  'arrow-down-3': '0 0 24 24',
  'arrow-down-circle': '0 0 24 24',
  'arrow-down-square': '0 0 24 24',
  'arrow-left': '0 0 24 24',
  'arrow-left-2': '0 0 24 24',
  'arrow-left-3': '0 0 24 24',
  'arrow-left-circle': '0 0 24 24',
  'arrow-left-square': '0 0 24 24',
  'arrow-right': '0 0 24 24',
  'arrow-right-2': '0 0 24 24',
  'arrow-right-2-2': '0 0 24 24',
  'arrow-right-3': '0 0 24 24',
  'arrow-right-circle': '0 0 24 24',
  'arrow-right-square': '0 0 24 24',
  'arrow-up': '0 0 24 24',
  'arrow-up-2': '0 0 24 24',
  'arrow-up-3': '0 0 24 24',
  'arrow-up-circle': '0 0 24 24',
  'arrow-up-square': '0 0 24 24',
  'avatar': '0 0 24 24',
  'bag': '0 0 24 24',
  'bag-2': '0 0 24 24',
  'bag-3': '0 0 24 24',
  'bookmark': '0 0 24 24',
  'buy': '0 0 24 24',
  'calendar': '0 0 24 24',
  'call': '0 0 24 24',
  'call-missed': '0 0 24 24',
  'call-silent': '0 0 24 24',
  'calling': '0 0 24 24',
  'camera': '0 0 24 24',
  'card': '0 0 24 24',
  'category': '0 0 24 24',
  'chart': '0 0 24 24',
  'chat': '0 0 24 24',
  'chat-2': '0 0 24 24',
  'close-square': '0 0 24 24',
  'danger-circle': '0 0 24 24',
  'danger-triangle': '0 0 24 24',
  'delete': '0 0 24 24',
  'delete-2': '0 0 24 24',
  'discount': '0 0 24 24',
  'discovery': '0 0 24 24',
  'document': '0 0 24 24',
  'download': '0 0 24 24',
  'download-2': '0 0 24 24',
  'edit': '0 0 24 24',
  'edit-square': '0 0 24 24',
  'emoji': '0 0 24 24',
  'filter': '0 0 24 24',
  'filter-3': '0 0 24 24',
  'folder': '0 0 24 24',
  'game': '0 0 24 24',
  'graph': '0 0 24 24',
  'heart': '0 0 24 24',
  'heart2': '0 0 24 24',
  'hide': '0 0 24 24',
  'home': '0 0 24 24',
  'home-2': '0 0 24 24',
  'image': '0 0 24 24',
  'image-3': '0 0 24 24',
  'info-square': '0 0 24 24',
  'location': '0 0 24 24',
  'location-2': '0 0 24 24',
  'lock': '0 0 24 24',
  'login': '0 0 24 24',
  'login-2': '0 0 24 24',
  'logout': '0 0 24 24',
  'logout-2': '0 0 24 24',
  'message': '0 0 24 24',
  'more-circle': '0 0 24 24',
  'more-square': '0 0 24 24',
  'notification': '0 0 24 24',
  'notification-2': '0 0 24 24',
  'notification-3': '0 0 24 24',
  'paper': '0 0 24 24',
  'paper-download': '0 0 24 24',
  'paper-download-2': '0 0 24 24',
  'paper-fail': '0 0 24 24',
  'paper-negative': '0 0 24 24',
  'paper-plus': '0 0 24 24',
  'paper-upload': '0 0 24 24',
  'paper-upload-2': '0 0 24 24',
  'password': '0 0 24 24',
  'play': '0 0 24 24',
  'plus': '0 0 24 24',
  'profile': '0 0 24 24',
  'qr': '0 0 24 24',
  'scan': '0 0 24 24',
  'search': '0 0 24 24',
  'send': '0 0 24 24',
  'setting': '0 0 24 24',
  'setting-2': '0 0 24 24',
  'shield-done': '0 0 24 24',
  'shield-fail': '0 0 24 24',
  'show': '0 0 24 24',
  'star': '0 0 24 24',
  'star-2': '0 0 24 24',
  'swap': '0 0 24 24',
  'tick-square': '0 0 24 24',
  'ticket': '0 0 24 24',
  'ticket-star': '0 0 24 24',
  'time-circle': '0 0 24 24',
  'time-square': '0 0 24 24',
  'unlock': '0 0 24 24',
  'upload': '0 0 24 24',
  'upload-2': '0 0 24 24',
  'user-2': '0 0 24 24',
  'user-3': '0 0 24 24',
  'video': '0 0 24 24',
  'voice': '0 0 24 24',
  'voice-3': '0 0 24 24',
  'volume-down': '0 0 24 24',
  'volume-off': '0 0 24 24',
  'volume-up': '0 0 24 24',
  'wallet': '0 0 24 24',
  'work': '0 0 24 24',
};

/** Slug -> ikon govdesi (svg icindeki geometri). */
export const ICON_PATHS: Record<string, ReactNode> = {
  'activity': (
    <>
      <path d="M7.2168 14.7197L10.0223 11.0733L13.2225 13.5872L15.968 10.0438" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <circle cx="19.1679" cy="4.80171" r="1.80171" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="1" />
      <path d="M14.4154 3.78934H3.03027V21H20.2409V9.58914" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'add-user': (
    <>
      <path d="M19.043 8.66895V12.6789" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M21.088 10.6738H16.998" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M9.955 14.8189C6.69514 14.8105 3.93101 16.3022 2.91211 19.5242C4.96348 20.7748 7.37812 21.2564 9.955 21.2501C12.5319 21.2564 14.9465 20.7748 16.9979 19.5242C15.9802 16.3057 13.2114 14.8106 9.955 14.8189Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <circle cx="9.91973" cy="7.16973" r="4.41973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="3" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M12 18.9001V4.49988" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M18.0246 13.4501L12.0006 19.5001L5.97559 13.4501" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-down-2': (
    <>
      <path d="M19 8.5L12 15.5L5 8.5" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'arrow-down-3': (
    <>
      <path d="M11.9995 19.9996L11.9995 3.99987" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M6.33947 14.3398C9.24921 14.3398 11.9995 16.9024 11.9995 19.9999" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M17.6596 14.3398C14.7498 14.3398 11.9995 16.9024 11.9995 19.9999" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-down-circle': (
    <>
      <path d="M2.75 12C2.75 17.108 6.891 21.25 12 21.25C17.108 21.25 21.25 17.108 21.25 12C21.25 6.892 17.108 2.75 12 2.75C6.891 2.75 2.75 6.892 2.75 12Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M8.52881 10.5576L11.9998 14.0436L15.4708 10.5576" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-down-square': (
    <>
      <path d="M7.75 2.75H16.25C19.0114 2.75 21.25 4.98858 21.25 7.75V16.25C21.25 19.0114 19.0114 21.25 16.25 21.25H7.75C4.98858 21.25 2.75 19.0114 2.75 16.25V7.75C2.75 4.98858 4.98858 2.75 7.75 2.75Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M12 15.3383V7.91406" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M15.748 12.3223L12 16.0863L8.25195 12.3223" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M5.09976 12L19.5 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.5498 18.0246L4.4998 12.0006L10.5498 5.97559" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-left-2': (
    <>
      <path d="M15.5 19L8.5 12L15.5 5" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'arrow-left-3': (
    <>
      <path d="M3.99951 12L19.9993 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M9.65967 6.33995C9.65967 9.2497 7.09709 12 3.99962 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M9.65967 17.66C9.65967 14.7503 7.09709 12 3.99962 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-left-circle': (
    <>
      <path d="M12 2.75C6.892 2.75 2.75 6.891 2.75 12C2.75 17.108 6.892 21.25 12 21.25C17.108 21.25 21.25 17.108 21.25 12C21.25 6.891 17.108 2.75 12 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M13.4424 8.52881L9.95638 11.9998L13.4424 15.4708" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-left-square': (
    <>
      <path d="M21.25 16.25L21.25 7.75C21.25 4.98858 19.0114 2.75 16.25 2.75L7.75 2.75C4.98858 2.75 2.75 4.98858 2.75 7.75L2.75 16.25C2.75 19.0114 4.98858 21.25 7.75 21.25L16.25 21.25C19.0114 21.25 21.25 19.0114 21.25 16.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M8.6617 12L16.0859 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M11.6777 8.25205L7.91373 12L11.6777 15.748" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M18.9002 12.0001L4.5 12.0001" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M13.4502 5.97554L19.5002 11.9995L13.4502 18.0245" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-right-2': (
    <>
      <path d="M8.5 5L15.5 12L8.5 19" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'arrow-right-2-2': (
    <>
      <path d="M8.5 5L15.5 12L8.5 19" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'arrow-right-3': (
    <>
      <path d="M19.999 12L3.99926 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.3394 17.66C14.3394 14.7503 16.9019 12 19.9994 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.3394 6.33995C14.3394 9.2497 16.9019 12 19.9994 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-right-circle': (
    <>
      <path d="M12 21.25C17.108 21.25 21.25 17.109 21.25 12C21.25 6.892 17.108 2.75 12 2.75C6.892 2.75 2.75 6.892 2.75 12C2.75 17.109 6.892 21.25 12 21.25Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.5576 15.4712L14.0436 12.0002L10.5576 8.52919" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-right-square': (
    <>
      <path d="M2.75 16.25L2.75 7.75C2.75 4.98858 4.98858 2.75 7.75 2.75L16.25 2.75C19.0114 2.75 21.25 4.98858 21.25 7.75L21.25 16.25C21.25 19.0114 19.0114 21.25 16.25 21.25L7.75 21.25C4.98858 21.25 2.75 19.0114 2.75 16.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M15.3383 12L7.91406 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.3223 8.25205L16.0863 12L12.3223 15.748" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 5.09976V19.5" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M18.0246 10.5498L12.0006 4.4998L5.97559 10.5498" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-up-2': (
    <>
      <path d="M19 15.5L12 8.5L5 15.5" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'arrow-up-3': (
    <>
      <path d="M11.9995 4L11.9995 19.9998" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M6.33947 9.66016C9.24921 9.66016 11.9995 7.09758 11.9995 4.00011" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M17.6596 9.66016C14.7498 9.66016 11.9995 7.09758 11.9995 4.00011" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'arrow-up-circle': (
    <>
      <path d="M2.75 12C2.75 6.892 6.891 2.75 12 2.75C17.108 2.75 21.25 6.892 21.25 12C21.25 17.108 17.108 21.25 12 21.25C6.891 21.25 2.75 17.108 2.75 12Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M8.52881 13.4424L11.9998 9.95638L15.4708 13.4424" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'arrow-up-square': (
    <>
      <path d="M7.75 21.25H16.25C19.0114 21.25 21.25 19.0114 21.25 16.25V7.75C21.25 4.98858 19.0114 2.75 16.25 2.75H7.75C4.98858 2.75 2.75 4.98858 2.75 7.75V16.25C2.75 19.0114 4.98858 21.25 7.75 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M12 8.6617V16.0859" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M15.748 11.6777L12 7.91373L8.25195 11.6777" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'avatar': (
    <>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" key="0" />
      <path d="M13.2945 15.0725H9.70175L9.52051 14.7705L11.4363 8.27734" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M16.3857 11.1743H16.3957" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M6.93262 11.1743H6.94262" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'bag': (
    <>
      <path d="M16.7496 9.14953V8.03763C16.7496 5.41466 14.6232 3.28833 12.0003 3.28833C9.37731 3.28833 7.25098 5.41466 7.25098 8.03763V9.14953" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M20.1869 20.7116L21.25 7.35906L2.75 7.35907L3.81307 20.7116L20.1869 20.7116Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'bag-2': (
    <>
      <path d="M16.4729 6.65397C16.4729 4.35982 14.6132 2.50004 12.319 2.50004C11.2143 2.49536 10.1532 2.93093 9.37034 3.71046C8.58751 4.48998 8.14745 5.54923 8.14746 6.65397" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M15.17 10.9835H15.126" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M9.56262 10.9835H9.51862" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M19.8719 6.86499L20.7605 21.5002L3.24023 21.5002L4.12881 6.86499L19.8719 6.86499Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="3" />
    </>
  ),
  'bag-3': (
    <>
      <path d="M16.0194 9.76204V6.53882C16.0194 4.32339 14.2239 2.52787 12.0095 2.52787C9.79406 2.5183 7.99004 4.30532 7.98047 6.52075V6.53882V9.76204" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M21.25 7.28467L21.25 12.2221C21.25 17.3307 17.1086 21.4721 12 21.4721C6.89137 21.4721 2.75 17.3307 2.75 12.2221L2.75 7.28467L21.25 7.28467Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'bookmark': (
    <>
      <path d="M19.4776 2.75C13.6373 2.75 10.3628 2.75 4.52246 2.75V21.25L12.0251 17.8045L19.4776 21.25V2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M8.47852 9.22531H15.5219" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'buy': (
    <>
      <path d="M14.375 10.429H17.0467" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M7.65889 19.4927C7.94889 19.4927 8.18302 19.7278 8.18302 20.0168C8.18302 20.3068 7.94889 20.5419 7.65889 20.5419C7.36889 20.5419 7.13477 20.3068 7.13477 20.0168C7.13477 19.7278 7.36889 19.4927 7.65889 19.4927Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M18.5261 19.4927C18.8161 19.4927 19.0512 19.7278 19.0512 20.0168C19.0512 20.3068 18.8161 20.5419 18.5261 20.5419C18.2361 20.5419 18.002 20.3068 18.002 20.0168C18.002 19.7278 18.2361 19.4927 18.5261 19.4927Z" fillRule="evenodd" clipRule="evenodd" fill="currentColor" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M5.62516 6.51821H21.25L19.9806 16.1529H6.49355L5.21652 3.45801H2.75" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'calendar': (
    <>
      <path d="M3.76074 9.59898H20.248" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M16.1087 13.2115H16.1173" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.0043 13.2116H12.0128" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M7.89097 13.2116H7.89954" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M16.1087 16.8065H16.1173" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
      <path d="M12.0043 16.8066H12.0128" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="5" />
      <path d="M7.89097 16.8066H7.89954" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="6" />
      <path d="M15.741 2.75V5.79399" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="7" />
      <path d="M8.26831 2.75V5.79399" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="8" />
      <path d="M20.3258 4.21069H3.67578V21.25H20.3258V4.21069Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="9" />
    </>
  ),
  'call': (
    <>
      <path d="M2.80077 6.22175C1.85415 11.2831 8.66748 21.6565 17.8167 21.2377C19.3492 20.3799 20.4307 19.2985 21.2885 17.7659L16.6777 14.3659L13.8236 16.0093C13.8236 16.0093 11.824 15.4612 10.0314 13.6686C8.32344 11.9607 7.86965 10.0553 7.86965 10.0553L9.51304 7.20123L6.27252 2.75C4.78257 3.62391 3.66931 4.7293 2.80077 6.22175Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'call-missed': (
    <>
      <path d="M20.7137 4.57373L15.8613 9.42613" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M15.8613 4.57373L20.7137 9.42613" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M2.79979 6.22175C1.85318 11.2831 8.6665 21.6565 17.8157 21.2377C19.3483 20.3799 20.4297 19.2985 21.2875 17.7659L16.6768 14.3659L13.8227 16.0093C13.8227 16.0093 11.823 15.4612 10.0304 13.6686C8.32246 11.9607 7.86867 10.0553 7.86867 10.0553L9.51207 7.20123L6.27155 2.75C4.7816 3.62391 3.66833 4.7293 2.79979 6.22175Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'call-silent': (
    <>
      <path d="M10.8089 14.176C12.3561 15.4174 13.8227 15.8194 13.8227 15.8194L16.6768 14.176L21.2875 17.576C20.4297 19.1085 19.3483 20.19 17.8157 21.0477C14.0127 21.2218 10.6132 19.5312 8.00687 17.1325M6.05437 15.0291C3.62762 11.9726 2.35428 8.41389 2.79979 6.03181C3.66833 4.53936 4.7816 3.43397 6.27155 2.56006L9.51207 7.01129L7.86867 9.8654C7.86867 9.8654 8.08819 10.7871 8.79649 11.923" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M4.01458 21.3442L18.6293 5.75512" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
    </>
  ),
  'calling': (
    <>
      <path d="M14.2471 2.75C17.9481 3.161 20.8721 6.081 21.2871 9.782" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M14.2471 6.29297C16.0181 6.63697 17.4021 8.02197 17.7471 9.79297" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M2.79979 6.22175C1.85318 11.2831 8.6665 21.6565 17.8157 21.2377C19.3483 20.3799 20.4297 19.2985 21.2875 17.7659L16.6768 14.3659L13.8227 16.0093C13.8227 16.0093 11.823 15.4612 10.0304 13.6686C8.32246 11.9607 7.86867 10.0553 7.86867 10.0553L9.51207 7.20123L6.27155 2.75C4.7816 3.62391 3.66833 4.7293 2.79979 6.22175Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'camera': (
    <>
      <path d="M15.04 3.99219L16.772 6.69755H21.25L21.25 20.0082H2.75001L2.75 6.69755H7.228L8.95901 3.99219H15.04Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M17.9271 10.5352H17.9361" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M15.1783 13.2142C15.1783 11.4582 13.7553 10.0352 11.9993 10.0352C10.2433 10.0352 8.82031 11.4582 8.82031 13.2142C8.82031 14.9702 10.2433 16.3932 11.9993 16.3932C13.7553 16.3932 15.1783 14.9702 15.1783 13.2142Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'card': (
    <>
      <rect x="2.75" y="4.97021" width="18.5" height="14.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="0" />
      <path d="M2.75 9.78314H21.25" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.8516 15.3423H18.3268" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M10.626 15.3423H11.3738" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'category': (
    <>
      <rect x="2.60742" y="3.39331" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="0" />
      <rect x="14.6318" y="2.60669" width="7" height="7" transform="rotate(15 14.6318 2.60669)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="1" />
      <rect x="2.60742" y="14.3933" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="2" />
      <rect x="13.6074" y="14.3933" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="3" />
    </>
  ),
  'chart': (
    <>
      <path d="M7.16367 10.4277V16.4576" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M12.0006 7.54248V16.4576" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M16.8365 13.6143V16.4577" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="2" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="3" />
    </>
  ),
  'chat': (
    <>
      <path d="M18.5481 18.5225C22.1474 14.9228 22.1539 9.07996 18.5481 5.47373C14.9487 1.874 9.10096 1.874 5.50162 5.47466C3.69595 7.27993 2.79644 9.64195 2.79819 12.0045C2.79819 15.0387 4.77533 17.9754 4.77533 17.9754L2.75 21.2042C2.75 21.2042 8.5295 21.1525 11.8247 21.2237C14.2512 21.2761 16.693 20.3778 18.5481 18.5225Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M8.31455 12.3808H8.21581" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.0489 12.3809H11.9502" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M15.7833 12.3808H15.6846" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'chat-2': (
    <>
      <path d="M18.5481 18.5225C22.1474 14.9228 22.1539 9.07996 18.5481 5.47373C14.9487 1.874 9.10096 1.874 5.50162 5.47466C3.69595 7.27993 2.79644 9.64195 2.79819 12.0045C2.80068 15.357 2.75 21.2042 2.75 21.2042C2.75 21.2042 8.5295 21.1525 11.8247 21.2237C14.2512 21.2761 16.693 20.3778 18.5481 18.5225Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M8.31455 12.3808H8.21581" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.0489 12.3809H11.9502" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M15.7833 12.3808H15.6846" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'close-square': (
    <>
      <path d="M14.3955 9.59473L9.60352 14.3867" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.3956 14.3898L9.59961 9.59277" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'danger-circle': (
    <>
      <path d="M12 2.75C17.108 2.75 21.25 6.891 21.25 12C21.25 17.108 17.108 21.25 12 21.25C6.891 21.25 2.75 17.108 2.75 12C2.75 6.891 6.891 2.75 12 2.75Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9951 8.2041V12.6231" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M11.995 15.7959H12.005" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="2" />
    </>
  ),
  'danger-triangle': (
    <>
      <path d="M21.25 19.8131L12.0755 3.70984H11.9294L2.75 19.8131L3.07879 20.2902H20.8869L21.25 19.8131Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M12.0177 14.016V11.215" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.0112 16.8036H12.0203" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'delete': (
    <>
      <path d="M4.62598 7.40262H19.3736L18.0473 21.25H5.95222L4.62598 7.40262Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M7.81152 2.75H16.1882" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12 11.9995L12 16.6526" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'delete-2': (
    <>
      <path d="M4.11914 6.45117H19.8803L18.4629 21.2503H5.53654L4.11914 6.45117Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M16.4768 5.99734L15.4081 2.75H8.59314L7.52441 5.99734" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.001 11.3638L12.001 16.3366" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'discount': (
    <>
      <path d="M9.6582 14.134L14.1328 9.65942" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M14.0661 14.0715H14.074" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M9.71456 9.71897H9.72239" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="2" />
      <path d="M12 2.75C10.4694 4.76856 7.96888 5.80432 5.45926 5.45926C5.80432 7.96888 4.76856 10.4694 2.75 12C4.76856 13.5306 5.80432 16.0311 5.45926 18.5407C7.96888 18.1957 10.4694 19.2314 12 21.25C13.5306 19.2314 16.0311 18.1957 18.5407 18.5407C18.1957 16.0311 19.2314 13.5306 21.25 12C19.2314 10.4694 18.1957 7.96888 18.5407 5.45926C16.0311 5.80432 13.5306 4.76856 12 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'discovery': (
    <>
      <path d="M9.01562 14.9847L9.01663 14.9844L13.9134 13.9129L14.9851 9.01514L14.9841 9.01539L10.0874 10.0869L9.01562 14.9847Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" key="1" />
    </>
  ),
  'document': (
    <>
      <path d="M14.4418 9.22907H8.37207" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M10.6881 13.3932H8.37207" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <rect x="3.62695" y="2.75" width="16.7465" height="18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="2" />
    </>
  ),
  'download': (
    <>
      <path d="M11.9997 15.935V3.15723" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M8.7251 13.395L12.0001 16.6846L15.2761 13.395" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M16.625 9.41406H21.25V20.8429H2.75V9.41406H7.375" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'download-2': (
    <>
      <path d="M16.625 9.0542H21.25V20.483H2.75V9.0542H7.375" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12 17.4565L12 3.51727" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M7.40449 12.8608C9.76697 12.8608 12 14.9414 12 17.4564" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M16.5955 12.8608C14.233 12.8608 12 14.9414 12 17.4564" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'edit': (
    <>
      <path d="M16.1006 3L21 7.89939L7.89939 21L3.00461 20.9954L3 16.1006L16.1006 3Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M20.3222 20.9947L3.00488 20.9941" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'edit-square': (
    <>
      <path d="M12.9326 7.28607L16.7334 11.0869L6.57034 21.25L2.7731 21.2464L2.76953 17.4492L12.9326 7.28607Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12.9326 7.2861L16.7334 11.0869L6.57034 21.25L2.7731 21.2464L2.76953 17.4492L12.9326 7.2861Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M13.4932 13.4931L10.507 10.5069" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M2.76927 11.4464V2.75H21.2305V21.25H12.6937" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'emoji': (
    <>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" key="0" />
      <path d="M16.2476 12.5513C16.2476 14.8973 14.3458 16.7991 11.9998 16.7991C9.65378 16.7991 7.75195 14.8973 7.75195 12.5513" strokeWidth="1.5" stroke="currentColor" key="1" />
    </>
  ),
  'filter': (
    <>
      <path d="M9.24512 7.25391H18.8872" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M9.26039 7.19391C9.26039 5.75184 8.08265 4.58252 6.63019 4.58252C5.17774 4.58252 4 5.75184 4 7.19391C4 8.63599 5.17774 9.80531 6.63019 9.80531C8.08265 9.80531 9.26039 8.63599 9.26039 7.19391Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.7549 16.8667H5.11285" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M14.7396 16.8062C14.7396 15.3641 15.9174 14.1948 17.3698 14.1948C18.8223 14.1948 20 15.3641 20 16.8062C20 18.2483 18.8223 19.4176 17.3698 19.4176C15.9174 19.4176 14.7396 18.2483 14.7396 16.8062Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'filter-3': (
    <>
      <path d="M3 3.40674H21V7.11124L14.25 13.9977V18.834L9.75 20.5927V13.9977L3 7.11124V3.40674Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
    </>
  ),
  'folder': (
    <>
      <path d="M7.63281 15.0865H16.3678" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M21.25 20.3265H2.75V3.67346H9.71326L11.9749 6.45239H21.25V20.3265Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'game': (
    <>
      <path d="M8.64204 12.2319V15.8797" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.5022 14.056H6.78027" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.9901 12.3429H14.8858" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M16.7557 15.8247H16.6514" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M7.57812 3C7.57812 3.72125 8.1747 4.30594 8.91061 4.30594H9.93965C11.075 4.30998 11.9946 5.21129 11.9998 6.32402V7.03126" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
      <path d="M1.32129 14.0841C1.32129 17.9036 4.41764 21 8.23718 21L15.7618 21C19.5814 21 22.6777 17.9036 22.6777 14.0841C22.6777 10.2646 19.5814 7.1682 15.7618 7.1682L8.23719 7.16821C4.41764 7.16821 1.32129 10.2646 1.32129 14.0841Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="5" />
    </>
  ),
  'graph': (
    <>
      <path d="M18.2264 13.4961C18.2264 15.0296 17.7716 16.5287 16.9196 17.8039C16.0676 19.079 14.8566 20.0728 13.4398 20.6597C12.023 21.2465 10.464 21.4001 8.95987 21.1009C7.45578 20.8017 6.07418 20.0632 4.98979 18.9788C3.9054 17.8944 3.16692 16.5129 2.86774 15.0088C2.56855 13.5047 2.72211 11.9456 3.30897 10.5288C3.89584 9.11198 4.88967 7.901 6.16478 7.049C7.43988 6.197 8.939 5.74225 10.4726 5.74225L10.4726 13.4961H18.2264Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M13.5273 2.75018C15.5837 2.75018 17.5559 3.5671 19.01 5.02122C20.4641 6.47535 21.2811 8.44756 21.2811 10.504L13.5273 10.504L13.5273 2.75018Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'heart': (
    <>
      <path d="M21.2499 9.63556C21.24 7.09969 19.9096 4.71489 17.2866 3.86991C15.4855 3.28869 13.5236 3.61191 12 5.79939C10.4764 3.61191 8.51447 3.28869 6.71339 3.86991C4.09014 4.71498 2.75971 7.10024 2.75008 9.63643C2.72582 14.6801 7.83662 18.5397 11.9987 20.3844L12 20.3838L12.0013 20.3844C16.1636 18.5396 21.2748 14.6797 21.2499 9.63556Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
    </>
  ),
  'heart2': (
    <>
      <path d="M21.2499 9.63531C21.24 7.09945 19.9096 4.71464 17.2866 3.86966C15.4855 3.28845 13.5236 3.61167 12 5.79914C10.4764 3.61167 8.51447 3.28845 6.71339 3.86966C4.09014 4.71474 2.75971 7.09999 2.75008 9.63618C2.72582 14.6799 7.83662 18.5394 11.9987 20.3842L12 20.3836L12.0013 20.3842C16.1636 18.5393 21.2748 14.6794 21.2499 9.63531Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M15.7432 11.29C14.973 12.6129 13.6033 13.683 12.0196 13.6556C10.4358 13.683 9.0661 12.6129 8.2959 11.29" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'hide': (
    <>
      <path d="M21.25 7.40681C19.289 11.5349 15.806 14.0114 11.998 14.0114H12.002C8.194 14.0114 4.711 11.5349 2.75 7.40681" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M18.5898 11.2755L20.701 13.3866" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M5.33105 11.2755L3.21995 13.3866" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M15.1765 16.5929L14.332 13.6833" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M8.74338 16.5931L9.58789 13.6836" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
    </>
  ),
  'home': (
    <>
      <path d="M1.93359 11.3755L11.9998 2.75L22.0659 11.3755" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M4.09277 10.1592V21.2501H19.9103V10.1592" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12 12.7048L12 16.1132" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'home-2': (
    <>
      <path d="M9.45642 21.25V16.1711H14.5781V21.25H20.4437V8.74738L11.9008 2.75L3.55664 8.74738V21.25H9.45642Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
    </>
  ),
  'image': (
    <>
      <path d="M18.4911 18.2103H5.80762L5.78809 18.1782L8.06122 13.9698H8.17777L11.5155 15.6542L14.5304 11.6533H14.6259L18.5157 18.1781L18.4911 18.2103Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.428 8.11195C10.428 9.17296 9.56847 10.0325 8.50746 10.0325C7.44645 10.0325 6.58691 9.17296 6.58691 8.11195C6.58691 7.05094 7.44645 6.19141 8.50746 6.19141C9.56847 6.1925 10.428 7.05094 10.428 8.11195Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'image-3': (
    <>
      <path d="M10.7031 8.5752C10.7031 9.71105 9.78331 10.6309 8.64746 10.6309C7.51273 10.6309 6.5918 9.71105 6.5918 8.5752C6.5918 7.43935 7.51273 6.51953 8.64746 6.51953C9.7822 6.52064 10.702 7.44046 10.7031 8.5752Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M3.13574 20.7284L7.14523 15.3977H7.2589L10.0852 17.9342H10.2899L14.6062 11.6533H14.7635L21.0193 20.4777" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'info-square': (
    <>
      <path d="M11.9941 16V12" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9901 8.2041H12.0001" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'location': (
    <>
      <path d="M14.4868 10.8064C14.4868 9.43255 13.3736 8.31934 12.0007 8.31934C10.6269 8.31934 9.51367 9.43255 9.51367 10.8064C9.51367 12.1792 10.6269 13.2924 12.0007 13.2924C13.3736 13.2924 14.4868 12.1792 14.4868 10.8064Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9998 21.25C11.9998 21.25 4.72391 16.5108 4.54058 10.5973C4.41185 6.4451 7.87963 2.75008 11.9998 2.75008C16.1199 2.75008 19.5868 6.44504 19.4599 10.5973C19.2755 16.632 11.9998 21.25 11.9998 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'location-2': (
    <>
      <path d="M14.4004 9.60054C14.4004 8.27456 13.326 7.20013 12.001 7.20013C10.675 7.20013 9.60059 8.27456 9.60059 9.60054C9.60059 10.9255 10.675 12 12.001 12C13.326 12 14.4004 10.9255 14.4004 9.60054Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9995 22C11.9995 18.3971 4.97717 15.2813 4.80023 9.57381C4.67598 5.56628 8.02293 2 11.9995 2C15.9761 2 19.3222 5.56622 19.1997 9.57381C19.0218 15.3983 11.9995 18.3007 11.9995 22Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'lock': (
    <>
      <path d="M16.6293 9.09474V7.16335C16.6293 4.65035 14.5913 2.61235 12.0783 2.61235C9.5653 2.60135 7.5193 4.62935 7.5083 7.14335V7.16335V9.09474" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9312 14.0649V16.2859" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M19.6806 21.1123L19.6806 9.23877L4.45557 9.23877L4.45557 21.1123L19.6806 21.1123Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'login': (
    <>
      <path d="M15.935 12.0003L3.15723 12.0003" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M13.3955 15.2749L16.6851 11.9999L13.3955 8.72385" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M9.41406 7.375L9.41406 2.75L20.8429 2.75L20.8429 21.25L9.41406 21.25L9.41406 16.625" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'login-2': (
    <>
      <path d="M9.0542 7.375L9.0542 2.75L20.483 2.75L20.483 21.25L9.0542 21.25L9.0542 16.625" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M17.4565 12L3.51727 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M12.8608 16.5955C12.8608 14.233 14.9414 12 17.4564 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M12.8608 7.40449C12.8608 9.76697 14.9414 12 17.4564 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'logout': (
    <>
      <path d="M20.769 11.9997L7.99121 11.9997" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M18.229 8.7251L21.5186 12.0001L18.229 15.2761" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M13.0054 16.625L13.0054 21.25L2.48143 21.25L2.48144 2.75L13.0054 2.75L13.0054 7.375" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'logout-2': (
    <>
      <path d="M12.7993 16.625L12.7993 21.25L2.27538 21.25L2.27538 2.75L12.7993 2.75L12.7993 7.375" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M21.7246 12.001L7.78534 12.001" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M17.1289 7.40547C17.1289 9.76795 19.2095 12.001 21.7244 12.001" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M17.1289 16.5965C17.1289 14.234 19.2095 12.001 21.7244 12.001" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'message': (
    <>
      <path d="M17.8037 8.85107L12.0395 13.535L6.27539 8.85107" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <rect x="2" y="3" width="20" height="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="1" />
    </>
  ),
  'more-circle': (
    <>
      <path d="M6.21875 14.3125C8.13425 14.3125 9.6875 15.8654 9.6875 17.7812C9.6875 19.6967 8.13425 21.25 6.21875 21.25C4.30287 21.25 2.75 19.6967 2.75 17.7812C2.75 15.8658 4.30325 14.3125 6.21875 14.3125Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M17.7812 14.3125C19.6967 14.3125 21.25 15.8654 21.25 17.7812C21.25 19.6967 19.6967 21.25 17.7812 21.25C15.8654 21.25 14.3125 19.6967 14.3125 17.7812C14.3125 15.8658 15.8658 14.3125 17.7812 14.3125Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M12 2.75C13.9155 2.75 15.4688 4.30287 15.4688 6.21875C15.4688 8.13425 13.9155 9.6875 12 9.6875C10.0841 9.6875 8.53125 8.13425 8.53125 6.21875C8.53125 4.30325 10.0845 2.75 12 2.75Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="2" />
    </>
  ),
  'more-square': (
    <>
      <path d="M15.9398 12.0127H15.9488" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9301 12.0127H11.9391" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M7.92128 12.0127H7.93028" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="2" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="3" />
    </>
  ),
  'notification': (
    <>
      <path d="M19.8 17.8572H4.19922L5.81186 13.5184V8.93778C5.81186 5.52036 8.58222 2.75 11.9996 2.75C15.417 2.75 18.1874 5.52036 18.1874 8.93777V13.5184L19.8 17.8572Z" strokeWidth="1.5" stroke="currentColor" key="0" />
      <path d="M15.1673 17.8574V18.0834C15.1673 19.8323 13.7496 21.2501 12.0007 21.2501C10.2517 21.2501 8.83398 19.8323 8.83398 18.0834V17.8574" strokeWidth="1.5" stroke="currentColor" key="1" />
    </>
  ),
  'notification-2': (
    <>
      <path d="M18.1874 8.93778V13.5184L19.8 15.153V17.8572H4.19922V15.153L5.81186 13.5184V8.93778C5.81186 5.52036 8.58222 2.75 11.9996 2.75" strokeWidth="1.5" stroke="currentColor" key="0" />
      <path d="M15.1673 17.8574V18.0834C15.1673 19.8323 13.7496 21.2501 12.0007 21.2501C10.2517 21.2501 8.83398 19.8323 8.83398 18.0834V17.8574" strokeWidth="1.5" stroke="currentColor" key="1" />
      <circle cx="16.3379" cy="4.82434" r="2.34473" stroke="currentColor" strokeWidth="1.5" key="2" />
    </>
  ),
  'notification-3': (
    <>
      <path d="M11.9997 4.15835C15.4838 4.15835 18.3083 6.98283 18.3083 10.467V13.2602C18.3083 15.1465 18.8817 16.9882 19.9525 18.5411H4.04688C5.11762 16.9882 5.69101 15.1465 5.69101 13.2602V10.467C5.69101 6.98283 8.5155 4.15835 11.9997 4.15835ZM11.9997 4.15835V1.99978" strokeWidth="1.5" stroke="currentColor" key="0" />
      <path d="M15.2285 18.541V18.7715C15.2285 20.5545 13.7831 22 12 22C10.2169 22 8.77148 20.5545 8.77148 18.7715V18.541" strokeWidth="1.5" stroke="currentColor" key="1" />
    </>
  ),
  'paper': (
    <>
      <path d="M14.0927 16.2865H8.64941" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M12.0313 12.504H8.64844" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'paper-download': (
    <>
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M10.8644 16.3274V10.238" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M13.2276 14.5209L10.8638 16.8948L8.5 14.5209" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'paper-download-2': (
    <>
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M10.8633 17.5332L10.8633 9.68683" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M8.27648 14.9463C9.60632 14.9463 10.8633 16.1175 10.8633 17.5331" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M13.4501 14.9463C12.1202 14.9463 10.8633 16.1175 10.8633 17.5331" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
    </>
  ),
  'paper-fail': (
    <>
      <path d="M13.1559 15.8324L9.66211 12.3386" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M9.66406 15.8324L13.1578 12.3387" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'paper-negative': (
    <>
      <path d="M14.0926 14.411H9.15332" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'paper-plus': (
    <>
      <path d="M14.0926 14.411H9.15332" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.6229 16.8807L11.6229 11.9414" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M14.0918 3.30469V8.65011H19.1989" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'paper-upload': (
    <>
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.0923 3.30469V8.65011H19.1993" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M10.8644 10.8055V16.8948" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M13.2281 12.6118L10.8643 10.238L8.50049 12.6118" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'paper-upload-2': (
    <>
      <path d="M14.5679 2.75L4.3252 2.75V21.25H19.6745V8.06826L14.5679 2.75Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M14.0928 3.30469V8.65011H19.1998" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M10.8643 10.481L10.8643 18.3273" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M8.27746 13.0679C9.60729 13.0679 10.8643 11.8967 10.8643 10.4811" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M13.4511 13.0679C12.1212 13.0679 10.8643 11.8967 10.8643 10.4811" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
    </>
  ),
  'password': (
    <>
      <path d="M10.6894 12.0004C10.6894 13.0234 9.86035 13.8524 8.83735 13.8524C7.81435 13.8524 6.98535 13.0234 6.98535 12.0004C6.98535 10.9774 7.81435 10.1484 8.83735 10.1484H8.84035C9.86135 10.1494 10.6894 10.9784 10.6894 12.0004Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.6919 12H17.0099V13.852" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M14.1816 13.852V12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="3" />
    </>
  ),
  'play': (
    <>
      <path d="M12 2.75C17.1078 2.75 21.25 6.89122 21.25 12C21.25 17.1088 17.1078 21.25 12 21.25C6.89122 21.25 2.75 17.1088 2.75 12C2.75 6.89122 6.89122 2.75 12 2.75Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M14.9213 11.9952L10.4141 9.13315V14.8573L14.9213 11.9952Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'plus': (
    <>
      <path d="M11.9996 8.32764V15.654" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M15.6673 11.9904H8.33398" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'profile': (
    <>
      <path d="M11.9999 14.8189C8.74006 14.8105 5.97593 16.3022 4.95703 19.5242C7.0084 20.7748 9.42304 21.2564 11.9999 21.2501C14.5768 21.2564 16.9914 20.7748 19.0428 19.5242C18.0251 16.3057 15.2563 14.8106 11.9999 14.8189Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <circle cx="11.9998" cy="7.16973" r="4.41973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="1" />
    </>
  ),
  'qr': (
    <>
      <rect x="3.25" y="3.25" width="6.80556" height="6.80556" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="0" />
      <rect x="3.25" y="13.9445" width="6.80556" height="6.80556" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="1" />
      <rect x="13.9443" y="13.9445" width="6.80556" height="6.80556" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="2" />
      <path d="M20.7499 7.625V10.0556H19.0485M20.7499 4.95139V3.25H19.0485M16.3749 3.25H13.9443V7.36973M16.1645 10.0556H13.9443" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M16.2676 5.6156V7.83398H18.0967" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
      <path d="M18.6934 5.61551L18.6934 5.60551" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="5" />
      <path d="M6.65234 6.70117L6.65234 6.60395" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="6" />
      <path d="M6.65234 17.3955L6.65234 17.2983" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="7" />
      <path d="M17.3477 17.3955L17.3477 17.2983" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="8" />
    </>
  ),
  'scan': (
    <>
      <path d="M22 12.7855H2" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M20.2185 8.77539V3.78015H15.5156" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M3.78125 8.77539V3.78015H8.51363" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M20.2185 12.7845V20.2198H15.5156" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M3.78125 12.7845V20.2198H8.51363" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
    </>
  ),
  'search': (
    <>
      <circle cx="10.9985" cy="10.7888" r="8.03854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="0" />
      <path d="M16.4873 16.7083L21.0408 21.25" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'send': (
    <>
      <path d="M21.2984 2.7019L21.2656 2.66797L2.70215 8.1875V8.21654L10.5435 13.4567L15.7836 21.298H15.8086L21.2984 2.7019Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M10.7896 13.2685L15.2319 8.82617" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'setting': (
    <>
      <path d="M15.6876 11.9999C15.6876 14.0365 14.0366 15.6875 12 15.6875C9.96347 15.6875 8.3125 14.0365 8.3125 11.9999C8.3125 9.96335 9.96347 8.31238 12 8.31238C14.0366 8.31238 15.6876 9.96335 15.6876 11.9999Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M18.3659 15.6753L18.8038 18.7156L14.4141 21.25L12.0006 19.3511L9.58718 21.25L5.19744 18.7156L5.63527 15.6759L2.78223 14.5345V9.46567L5.63427 8.32471L5.19636 5.28442L9.5861 2.75L12.0006 4.64979L14.4152 2.75L18.8049 5.28442L18.3669 8.32522L21.2177 9.46567V14.5345L18.3659 15.6753Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'setting-2': (
    <>
      <circle cx="12.0007" cy="12" r="2.8499" transform="rotate(90 12.0007 12)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" key="0" />
      <path d="M22 12.0001L17 20.6604H7L2 12.0001L7 3.33984L17 3.33984L22 12.0001Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'shield-done': (
    <>
      <path d="M9.38672 10.6959L11.2787 12.5909L15.1767 8.69092" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12.0006 21C12.0006 21 19.8685 18.6177 19.8685 12.0503V3H4.13281V12.0503C4.13281 18.6177 12.0006 21 12.0006 21Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'shield-fail': (
    <>
      <path d="M13.9125 13.0199L10.0586 9.16602" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M10.0586 13.0199L13.9125 9.16602" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M12.0006 21C12.0006 21 19.8685 18.6177 19.8685 12.0503V3H4.13281V12.0503C4.13281 18.6177 12.0006 21 12.0006 21Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'show': (
    <>
      <path d="M15.0076 13.7221C15.0076 15.4681 13.5916 16.8831 11.8456 16.8831C10.0996 16.8831 8.68457 15.4681 8.68457 13.7221C8.68457 11.9751 10.0996 10.5601 11.8456 10.5601C13.5916 10.5601 15.0076 11.9751 15.0076 13.7221Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M21.0967 13.7213C19.1357 9.59319 15.6527 7.1167 11.8447 7.1167H11.8487C8.04068 7.1167 4.55768 9.59319 2.59668 13.7213" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'star': (
    <>
      <path d="M12 2.75C10.8297 7.28687 7.28687 10.8297 2.75 12C7.28687 13.1703 10.8297 16.7131 12 21.25C13.1703 16.7131 16.7131 13.1703 21.25 12C16.7131 10.8297 13.1703 7.28687 12 2.75Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="0" />
      <path d="M18.7513 2.75C18.7513 3.8975 20.0706 5.24836 21.2496 5.24836C20.0252 5.24836 18.7513 6.58523 18.7513 7.74671C18.7513 6.57766 17.398 5.24836 16.2529 5.24836C17.4434 5.24836 18.7513 3.8975 18.7513 2.75Z" fill="currentColor" stroke="none" key="1" />
    </>
  ),
  'star-2': (
    <>
      <path d="M12 2.75V21.25" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M21.25 12L2.75 12" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M18.541 5.45947L5.45954 18.5409" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M18.541 18.5405L5.45954 5.45905" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'swap': (
    <>
      <path d="M16.6548 20.1495L16.6548 6.21026" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12.0593 15.5548C14.4218 15.5548 16.6548 17.6354 16.6548 20.1503" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M21.2503 15.5548C18.8878 15.5548 16.6548 17.6354 16.6548 20.1503" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M7.3457 3.84973L7.3457 17.789" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M2.75019 8.44543C5.11267 8.44543 7.3457 6.36483 7.3457 3.84992" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
      <path d="M11.9412 8.44543C9.57873 8.44543 7.3457 6.36483 7.3457 3.84992" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="5" />
    </>
  ),
  'tick-square': (
    <>
      <path d="M8.37075 11.2583C10.4598 12.579 12.0207 14.939 12.0207 14.939H12.052C12.052 14.939 15.368 9.0712 21.5286 5.4624" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M2.47119 12C2.47119 17.1086 6.61256 21.25 11.7212 21.25C16.8298 21.25 20.9712 17.1086 20.9712 12C20.9712 6.89137 16.8298 2.75 11.7212 2.75C6.61256 2.75 2.47119 6.89137 2.47119 12Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'ticket': (
    <>
      <path d="M13.7105 4.83203V7.07053" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M13.7105 17.3281V19.2003" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M13.7105 14.429V9.9696" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M21.25 19.4001V13.9894C20.1348 13.9894 19.2366 13.1024 19.2366 12.0011C19.2366 10.8997 20.1348 10.0117 21.25 10.0117V4.6001H2.75V10.0898C3.86525 10.0898 4.76343 10.8997 4.76343 12.0011C4.76343 13.1024 3.86525 13.9894 2.75 13.9894V19.4001H21.25Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'ticket-star': (
    <>
      <path d="M21.25 19.4V13.9893C20.1348 13.9893 19.2366 13.1023 19.2366 12.0009C19.2366 10.8996 20.1348 10.0116 21.25 10.0116V4.59998H2.75V10.0897C3.86525 10.0897 4.76343 10.8996 4.76343 12.0009C4.76343 13.1023 3.86525 13.9893 2.75 13.9893V19.4H21.25Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M11.9991 8.67334L12.9826 10.5375L15.0594 10.8968L13.5904 12.4082L13.8904 14.4944L11.9991 13.5644L10.1077 14.4944L10.4077 12.4082L8.93874 10.8968L11.0155 10.5375L11.9991 8.67334Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'time-circle': (
    <>
      <path d="M21.25 12C21.25 17.109 17.109 21.25 12 21.25C6.891 21.25 2.75 17.109 2.75 12C2.75 6.891 6.891 2.75 12 2.75C17.109 2.75 21.25 6.891 21.25 12Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M15.4321 14.9422L11.6621 12.6932V7.84619" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'time-square': (
    <>
      <path d="M15.391 14.0178L12 11.9948V7.63379" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="1" />
    </>
  ),
  'unlock': (
    <>
      <path d="M7.5083 9.09474V7.16335V7.14335C7.5193 4.62935 9.5653 2.60135 12.0783 2.61235C13.3872 2.61235 14.5672 3.16519 15.3975 4.05005" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="0" />
      <path d="M11.9312 14.0649V16.2859" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M19.6806 21.1123L19.6806 9.23877L4.45557 9.23877L4.45557 21.1123L19.6806 21.1123Z" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" key="2" />
    </>
  ),
  'upload': (
    <>
      <path d="M11.9997 3.23101L11.9997 16.0088" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M8.7251 5.771L12.0001 2.48143L15.2761 5.771" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M16.625 10.9946L21.25 10.9946L21.25 21.5186L2.75 21.5186L2.75 10.9946L7.375 10.9946" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'upload-2': (
    <>
      <path d="M16.625 11.2007L21.25 11.2007L21.25 21.7246L2.75 21.7246L2.75 11.2007L7.375 11.2007" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12.001 2.27539L12.001 16.2147" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M7.40547 6.87109C9.76795 6.87109 12.001 4.79048 12.001 2.27558" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M16.5965 6.87109C14.234 6.87109 12.001 4.79048 12.001 2.27558" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'user-2': (
    <>
      <path d="M9.51408 14.707C6.38327 14.699 3.72857 16.1316 2.75 19.2261C4.72016 20.4271 7.03921 20.8897 9.51408 20.8836C11.9889 20.8897 14.308 20.4271 16.2782 19.2261C15.3007 16.1349 12.6415 14.699 9.51408 14.707Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M16.0852 18.2324C17.975 18.237 19.7458 17.8838 21.2502 16.9667C20.5039 14.6064 18.4733 13.5099 16.0852 13.516C14.5809 13.5121 13.2205 13.9439 12.2324 14.8532" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <circle cx="9.51421" cy="7.35259" r="4.23687" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="2" />
      <path d="M13.7141 5.67014C14.3043 5.05148 15.1369 4.66602 16.0595 4.66602C17.8496 4.66602 19.3008 6.11718 19.3008 7.90729C19.3008 9.69739 17.8496 11.1486 16.0595 11.1486C14.9652 11.1486 13.9975 10.6063 13.4106 9.77575" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'user-3': (
    <>
      <path d="M11.9817 14.6231C8.94836 14.6153 6.37632 16.0033 5.42822 19.0014C7.33704 20.1651 9.58388 20.6133 11.9817 20.6074C14.3795 20.6133 16.6263 20.1651 18.5352 19.0014C17.5882 16.0066 15.0118 14.6153 11.9817 14.6231Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M6.59473 13.773C4.47036 13.7675 2.66407 14.7429 2.00013 16.8426C2.72482 17.2844 3.519 17.5791 4.36185 17.7558" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M17.4058 13.773C19.5301 13.7675 21.3364 14.7429 22.0004 16.8426C21.2757 17.2844 20.4815 17.5791 19.6386 17.7558" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <circle cx="11.9998" cy="7.49102" r="4.09844" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="3" />
      <path d="M16.4833 6.05059C16.7729 5.95272 17.0831 5.89966 17.4058 5.89966C18.9964 5.89966 20.2858 7.18907 20.2858 8.77964C20.2858 10.3702 18.9964 11.6596 17.4058 11.6596C16.6328 11.6596 15.9309 11.3551 15.4136 10.8594" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
      <path d="M7.25078 5.97469C7.04007 5.92561 6.82048 5.89966 6.59483 5.89966C5.00426 5.89966 3.71484 7.18907 3.71484 8.77964C3.71484 10.3702 5.00426 11.6596 6.59483 11.6596C7.28805 11.6596 7.92407 11.4147 8.42107 11.0067" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="5" />
    </>
  ),
  'video': (
    <>
      <rect x="2" y="5.12476" width="14.4845" height="13.7503" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" key="0" />
      <path d="M17.006 9.38123L22 5.99512V18.005L17.006 14.3862" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M9.1582 9.08618H12.3629" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'voice': (
    <>
      <path d="M12 21.4999V17.11" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M9.27949 21.5H14.7197" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M20.5049 11.9997V7.60986" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M3.49512 11.9999V7.61005" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
      <path d="M12.0004 17.1099C9.63378 17.1099 7.71484 15.1832 7.71484 12.8056V6.80545C7.71484 4.42784 9.63378 2.5 12.0004 2.5C14.3681 2.5 16.2859 4.42784 16.2859 6.80545V12.8056C16.2859 15.1832 14.3681 17.1099 12.0004 17.1099Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="4" />
    </>
  ),
  'voice-3': (
    <>
      <path d="M13.5381 6.83403H15.6905" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M12.458 10.4449H15.6928" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M11.998 21.5V18.7286" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M11.9982 15.0983C9.95745 15.0983 8.30273 13.4368 8.30273 11.3866V6.21264C8.30273 4.1624 9.95745 2.5 11.9982 2.5C14.0399 2.5 15.6937 4.1624 15.6937 6.21264V11.3866C15.6937 13.4368 14.0399 15.0983 11.9982 15.0983Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" key="3" />
      <path d="M19.2777 11.4162C19.2777 15.4544 16.0197 18.7284 11.9992 18.7284C7.97965 18.7284 4.72168 15.4544 4.72168 11.4162" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="4" />
    </>
  ),
  'volume-down': (
    <>
      <path d="M18.3145 7.99512C19.7396 10.4847 19.7396 13.525 18.3145 16.0068" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M4.61859 15.9363H8.99949L13.1254 19.5127H13.901V4.4873H13.1254L8.99949 8.06378H4.61859C4.61644 10.688 4.61644 13.3122 4.61859 15.9363Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
    </>
  ),
  'volume-off': (
    <>
      <path d="M3.41351 16.262H7.79441L11.9203 19.8383H12.6959V4.81299H11.9203L7.79441 8.38946H3.41351C3.41136 11.0137 3.41136 13.6378 3.41351 16.262Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M20.5871 14.0588L17.1211 10.5928" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="1" />
      <path d="M17.1221 14.0588L20.5881 10.5928" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" stroke="currentColor" key="2" />
    </>
  ),
  'volume-up': (
    <>
      <path d="M19.168 5.37512C21.9394 9.36486 21.9485 14.6276 19.168 18.6252" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M16.4473 7.99506C17.8724 10.4846 17.8724 13.5249 16.4473 16.0067" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M2.7514 15.9363H7.1323L11.2582 19.5127H12.0338V4.4873H11.2582L7.1323 8.06378H2.7514C2.74925 10.688 2.74925 13.3122 2.7514 15.9363Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
    </>
  ),
  'wallet': (
    <>
      <path d="M21.6303 16.7095H17.5561C16.0601 16.7087 14.8476 15.6057 14.8467 14.2438C14.8467 12.8819 16.0601 11.7789 17.5561 11.7781H21.6303" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M2.36914 5.72598H21.6305V21.25H2.36914V5.72598Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M18.9983 5.628V2.75074L2.36914 2.75V21.2495" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M6.93359 10.2938H12.3671" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
  'work': (
    <>
      <path d="M12 17.2265V14.6895" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="0" />
      <path d="M21.2449 5.87988V12.3799C18.7849 13.8199 15.5349 14.6899 11.9949 14.6899C8.45488 14.6899 5.21488 13.8199 2.75488 12.3799V5.87988H21.2449Z" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="1" />
      <path d="M15.5 5.61115L14.5001 3.2998H9.5001L8.5 5.61115" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="2" />
      <path d="M2.7793 15.1932L2.9683 20.7002H21.0313L21.2203 15.1932" strokeWidth="1.5" strokeLinecap="square" stroke="currentColor" key="3" />
    </>
  ),
};
