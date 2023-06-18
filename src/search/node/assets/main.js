const defaultRange = ['P', 'CF', 'AT'];
const supportType = ['AT', 'CF', 'P', 'B'];
var cntSamples, typeofSamples;

const initRange = () => {
    const setRangeDefault = () => {
        $(`.search-range`).prop('checked', false);
        defaultRange.forEach(range =>
            $(`#search-range--${range}`).prop('checked', true)
        );
    }
    setRangeDefault();

    $('.search-range--selectAll').click(() => {
        $(`.search-range`).prop('checked', true);
    });
    $('.search-range--default').click(setRangeDefault);
};

const initSamples = () => {
    cntSamples = 0, typeofSamples = new Array();
    $('.search-samples--deleteAll').click(() => {
        $('.search-sample').empty();
        cntSamples = 0, typeofSamples = new Array();
    });
    $('.search-samples--newSample').click(() => {
        $('.search-sample').append(`
            <div class="row search-samples--sample search-samples--${cntSamples}">
                <div class="column-one-second">
                    <div style="padding-right: 5px;">
                        <textarea class="input"></textarea>
                    </div>
                </div>
                <div class="column-one-second">
                    <div style="padding-left: 5px;">
                        <textarea class="output"></textarea>
                    </div>
                </div>
            </div>
        `);
        cntSamples++, typeofSamples.push('sample');
    });
    $('.search-samples--newText').click(() => {
        $('.search-sample').append(`
            <div class="search-samples--text search-samples--${cntSamples}">
                <textarea></textarea>
            </div>
        `);
        cntSamples++, typeofSamples.push('text');
    });
};

const initSearcher = () => {
    $('.search-searcher').click(() => {
        var options = {};
        options.mode = $('.search-mode option:selected').val();
        options.range = new Array();
        supportType.forEach(type => {
            if ($(`#search-range--${type}`).is(':checked'))
                options.range.push(type);
        });
        options.sample = new Array();
        for (var i = 0; i < cntSamples; i++) {
            if (typeofSamples[i] == 'text')
                options.sample.push($(`.search-samples--${i} textarea`).val());
            else
                options.sample.push({
                    input: $(`.search-samples--${i} .input`).val(),
                    output: $(`.search-samples--${i} .output`).val()
                });
        }
        $('.search-result').html(`<p class="search-result-tip">正在搜索中……</p>`);
        $.post(
            "/api",
            { options: JSON.stringify(options) },
            (data, status) => {
                var HTML;
                if (data.err) HTML = `<p class="search-result-error">${data.err}</p>`;
                else {
                    HTML = `<table><tr><th>类型</th><th>题目</th><th>链接</th></tr>`;
                    data.forEach(pro => {
                        HTML += `<tr><td>${pro.type}</td><td><b>${pro.pid}</b> ${pro.title}</td><td>`;
                        pro.url.forEach((url, index) =>
                            HTML += `<a href="${url}" class="search-result-link">链接 ${index + 1}</a>`
                        );
                        HTML += `</td></tr>`;
                    });
                    HTML += `</table>`;
                }
                $('.search-result').html(HTML);
            }
        );
    });
};

$(document).ready(() => {
    initRange();
    initSamples();
    initSearcher();
});