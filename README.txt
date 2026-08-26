VAPORIX — demo storefront
Откройте index.html в браузере.

Внутри уже есть:
- адаптивная тёмная верстка в стиле референсов;
- градиенты pink/purple;
- hero-баннер;
- категории и фильтрация;
- поиск;
- карточки товаров и оптовые уровни цен;
- корзина;
- выбор вкуса перед добавлением товара;
- 4-шаговое оформление заказа: контакты → доставка → проверка → статус;
- реальные публичные заказы через Supabase RPC `create_public_order`;
- активные заказы в профиле с миниатюрами и деталями;
- профиль/настройки;
- age gate 18+.

Оплата в интерфейсе пока не подключает платёжный шлюз: заказ создаётся в Supabase и получает статус `created`. Серверная функция `create_public_order` проверяет товар, вкус, остаток, стоимость доставки и комиссию, после чего создаёт заказ и строки заказа. Перед запуском реального магазина отдельно подключите платёжный шлюз, юридические документы, проверку возраста и региональные ограничения.


CLEANUP 2026-08-26
- Removed obsolete stability/card patches and the workflow that re-injected them.
- Removed obsolete part6 card handler that called openProductDetail (the Info transition bug).
- Catalog cards no longer contain quantity controls; Add to cart uses the full action row.
- The checkout hotfix part5 is the single authoritative product chooser.
- Removed the duplicate multi-flavor chooser from config.js; active chooser is single-flavor.


CLEAN ARCHITECTURE 2026-08-26
- One catalog Add-to-cart handler: order_flow_runtime.js.
- One product chooser: single flavor at a time, quantity inside the chooser.
- Removed obsolete vpx stability/card patches, part-based checkout loader, and the workflow that re-injected patches.
- Removed the old part6 handler that called openProductDetail and caused the Info/navigation conflict.
- Product cards no longer render quantity controls; Add-to-cart spans the action row.
