let data = [];

// 加载 JSON 数据
fetch('build/data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不是 OK');
        }
        return response.json();
    })
    .then(jsonData => {
        data = jsonData;
        console.log('数据加载成功:', data); // 调试输出
    })
    .catch(error => {
        console.error('加载 JSON 数据时出错:', error);
    });

function queryDisease() {
    console.log('queryDisease 函数被调用'); // 调试输出

    const metaboliteInput = document.getElementById('Description').value.trim().toLowerCase();
    const modalResultsDiv = document.getElementById('modal-results');
    const modal = document.getElementById('myModal');

    // 清除之前的模态框内容
    modalResultsDiv.innerHTML = '';

    if (!metaboliteInput) {
        const message = '请输入临床记录的特征';
        modalResultsDiv.innerHTML = `<p>${message}</p>`;
        modal.style.display = "block";
        return;
    }

    console.log('请输入临床记录的特征:', metaboliteInput); // 调试输出

    // 移除常见的连接词（例如 and, or, the 等）
    const stopWords = ['localized','el', 'tor','Infections', 'and', 'more','due to','she','is', 'a','girl','boy','he','other','male', 'unspecified', 'e', 'in', 'of', 'with', 'any', 'form', 'nodes', 'or', 'specified', 'cord', 'or', 'central', 'system', 'column', 'hip', 'male', 'tissue', 'site', 'elsewhere', 'classified', 'conditions', 'bulbar', 'viral', 'from', 'human', 'yellow', 'west', 'public', 'effect', 'lesser', 'sites', 'zone', 'involving', 'large', 'small', 'disease', 'multiple', 'chronic','in', 'multiple', 'cell', 'without', 'mention', 'type', 'tumor', 'NOS', 'sites', 'any', 'benign', 'unknown', 'upper', 'soft', 'eye', 'lower', 'nature', 'crisis', 'mention', 'men', 'host', 'red', 'social', 'disorder', 'personality', 'dependence', 'similarly', 'control', 'pain', 'elsewhere', 'side', 'wall','icd','Based','Features','This','Tool','On','Codes','The','Was','Downloaded']; // 可以根据需要添加更多的停止词
    const descriptions = metaboliteInput.split(' ').map(desc => desc.trim()).filter(desc => desc.length > 0 && !stopWords.includes(desc));

    if (descriptions.length === 0) {
        const message = '请输入有效的临床记录的特征';
        modalResultsDiv.innerHTML = `<p>${message}</p>`;
        modal.style.display = "block";
        return;
    }

    // 查找相关疾病，使用模糊匹配
    const allResults = {};

    descriptions.forEach(desc => {
        // 遍历每个描述并查询数据中的相关项
        const results = data.filter(item => 
            item.Description && item.Description.toLowerCase().includes(desc)
        );

        if (results.length > 0) {
            allResults[desc] = results;
        }
    });

    console.log('查询结果:', allResults); // 调试输出

    // 构建模态框显示内容
    let modalDisplayContent = '';

    // 处理每个描述的查询结果
    if (Object.keys(allResults).length === 0) {
        modalDisplayContent = `<p>没有相关的临床记录特征，无法查询其ICD-9 代码。</p>`;
    } else {
        descriptions.forEach(desc => {
            if (allResults[desc] && allResults[desc].length > 0) {
                const output = allResults[desc].map(item => `${item.Description} (ICD Code: ${item.ICD_CODE})`).join('<br>');
                modalDisplayContent += `<strong>${capitalizeFirstLetter(desc)}</strong>:<br>${output}<br><br>`;
            } else {
                const message = `未预测到 "<em>${capitalizeFirstLetter(desc)}</em>" 相关的ICD-9代码。`;
                modalDisplayContent += `<strong>${capitalizeFirstLetter(desc)}</strong>: ${message}<br><br>`;
            }
        });
    }

    modalResultsDiv.innerHTML = modalDisplayContent;
    modal.style.display = "block"; // 显示模态框
}

function clearInput() {
    document.getElementById('Description').value = '';
    closeModal();
    // 移除对 resultsDiv 的清空逻辑
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

// 点击模态框外部关闭模态框
window.onclick = function(event) {
    const modal = document.getElementById('myModal');
    if (event.target == modal) {
        closeModal();
    }
}

// 辅助函数：首字母大写
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
