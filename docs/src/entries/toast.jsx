import { mountDocs } from '../mount.jsx';
import ToastPage from '../pages/toast.jsx';

mountDocs({
  file: 'toast.html',
  title: 'Toast',
  kicker: 'Component',
  lead: (
    <>
      Всплывающее уведомление в углу экрана: подтверждение действия, фоновая ошибка. Стек создаётся
      модулем при первом тосте (как <code>.offcanvas-backdrop</code>), авто-исчезновение по таймеру +
      ручное закрытие.
    </>
  ),
  flags: ['styles.toast', 'scripts.toast'],
  Page: ToastPage,
  onReady() {
    let cartCount = 0;
    const cartCountEl = document.getElementById('docsCartCount');

    function fakeServerRequest(shouldFail) {
      return new Promise((resolve, reject) => {
        window.setTimeout(() => {
          if (shouldFail) {
            reject(new Error('Товар закончился на складе'));
          } else {
            cartCount += 1;
            resolve({ message: 'Товар «Кроссовки Runner» добавлен', cartCount });
          }
        }, 600);
      });
    }

    async function addToCart(shouldFail, button) {
      button.disabled = true;
      try {
        const response = await fakeServerRequest(shouldFail);
        if (cartCountEl) cartCountEl.textContent = `В корзине: ${response.cartCount}`;
        document.dispatchEvent(
          new CustomEvent('lf:toast', {
            detail: {
              title: 'Добавлено в корзину',
              message: response.message,
              variant: 'success',
              action: {
                label: `Корзина (${response.cartCount})`,
                onClick: () => {
                  document.dispatchEvent(
                    new CustomEvent('lf:toast', {
                      detail: { message: 'Переход в корзину… (демо)', variant: 'primary', duration: 2000 },
                    }),
                  );
                },
              },
            },
          }),
        );
      } catch (error) {
        document.dispatchEvent(
          new CustomEvent('lf:toast', {
            detail: {
              title: 'Не удалось добавить',
              message: error.message,
              variant: 'alert',
              duration: 0,
              action: { label: 'Повторить', onClick: () => addToCart(false, button) },
            },
          }),
        );
      } finally {
        button.disabled = false;
      }
    }

    document.getElementById('docsCartAdd')?.addEventListener('click', (event) => {
      addToCart(false, event.currentTarget);
    });
    document.getElementById('docsCartAddFail')?.addEventListener('click', (event) => {
      addToCart(true, event.currentTarget);
    });
  },
});
