document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. 共通パーツの読み込み処理 (fetch)（新規追加）
    // 画面内にある「data-include-html」という目印がついた要素をすべて探す
    // ==========================================
    const includeElements = document.querySelectorAll('[data-include-html]');

    includeElements.forEach(el => {
        const file = el.getAttribute('data-include-html');
        if (file) {
            // 指定されたHTMLファイル（/parts/menu.html など）を取得する
            fetch(file)
                .then(response => {
                    if (response.ok) return response.text();
                    throw new Error('パーツの読み込みに失敗しました');
                })
                .then(html => {
                    // 取得したHTMLを、目印の要素の中に流し込む
                    el.innerHTML = html;
                })
                .catch(error => {
                    console.error(error);
                    el.innerHTML = "<p>メニューの読み込みエラー</p>";
                });
        }
    });

    // ==========================================
    // 2. アバウトページのボタン処理（前回作ったものも残しておきます）
    // ==========================================
    const button = document.getElementById('greet-btn');
    if (button) {
        button.addEventListener('click', () => {
            alert('人参Roo Code のローカルサーバー環境からこんにちは！');
        });
    }

    // ==========================================
    // 3. 💡【新規】ギャラリーのモーダルウィンドウ処理
    // ==========================================
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalTargetImg');
    const closeBtn = document.querySelector('.modal-close');
    const galleryImages = document.querySelectorAll('.gallery-img');

    // ギャラリーの画像がクリックされたらモーダルを開く
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            modalImg.src = img.src; // クリックされた画像のURLをモーダル用画像にコピー
            modalImg.alt = img.alt; // alt属性もコピー
            modal.classList.add('open'); // 「open」クラスをつけて表示
        });
    });

    // 閉じるボタン（×）がクリックされたら閉じる
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    // 背景の黒い部分をクリックしても閉じられるようにする
    if (modal) {
        modal.addEventListener('click', (e) => {
            // クリックされたのが画像（modalImg）や閉じるボタンではなく、背景自体の場合だけ閉じる
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    }

    // ==========================================
    // 4. 💡【新規】展示会データの自動読み込みと生成
    // ==========================================
    const exhibitionList = document.getElementById('exhibition-list');
    
    function loadExhibitions() {
        if (!exhibitionList) return;
        fetch('/parts/exhibitions.json')
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('展示会データの読み込みに失敗しました');
            })
            .then(data => {
                let htmlContent = '';
                [...data].reverse().forEach(item => {
                    htmlContent += `<dt>${item.year}</dt><dd>${item.title}</dd>`;
                });
                exhibitionList.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error(error);
                exhibitionList.innerHTML = "<p>データの読み込みエラー</p>";
            });
    }
    loadExhibitions();

    // ==========================================
    // 4b. 💡【新規】文章データの自動読み込みと生成（Writingページ用）
    // ==========================================
    const writingList = document.getElementById('writing-list');

    function loadWritings() {
        if (!writingList) return;
        fetch('/parts/writing.json')
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('文章データの読み込みに失敗しました');
            })
            .then(data => {
                let htmlContent = '';
                [...data].reverse().forEach(item => {
                    htmlContent += `<dt>${item.date}</dt><dd>${item.content}</dd>`;
                });
                writingList.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error(error);
                writingList.innerHTML = "<p>データの読み込みエラー</p>";
            });
    }
    loadWritings();

    // ==========================================
    // 5. 管理に送信処理（fetch POST）を追加する
    // ==========================================
    const exhibitionForm = document.getElementById('exhibition-form');

    if (exhibitionForm) {
        exhibitionForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const yearInput = document.getElementById('input-year').value;
            const titleInput = document.getElementById('input-title').value;
            const messageEl = document.getElementById('form-message');

            const sendData = { year: yearInput, title: titleInput };

            fetch('/api/exhibitions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    messageEl.style.color = 'green';
                    messageEl.textContent = data.message;
                    exhibitionForm.reset();
                    loadExhibitions();
                } else {
                    messageEl.style.color = 'red';
                    messageEl.textContent = 'エラー: ' + data.message;
                }
            })
            .catch(error => {
                console.error('送信エラー:', error);
                messageEl.style.color = 'red';
                messageEl.textContent = 'サーバーとの通信に失敗しました。詳細はコンソールを確認してください。';
            });
        });
    }

    // Writingフォームの送信処理
    const writingForm = document.getElementById('writing-form');
    if (writingForm) {
        writingForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const dateInput = document.getElementById('writing-date').value;
            const contentInput = document.getElementById('writing-content').value;
            const messageEl = document.getElementById('writing-form-message');

            const sendData = { date: dateInput, content: contentInput };

            fetch('/api/writings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    messageEl.style.color = 'green';
                    messageEl.textContent = data.message;
                    writingForm.reset();
                    loadWritings();
                } else {
                    messageEl.style.color = 'red';
                    messageEl.textContent = 'エラー: ' + data.message;
                }
            })
            .catch(error => {
                console.error('送信エラー:', error);
                messageEl.style.color = 'red';
                messageEl.textContent = 'サーバーとの通信に失敗しました。詳細はコンソールを確認してください。';
            });
        });
    }







});
