import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple.js";

export function ensureTseMode() {
    if (CodeMirror.modes?.tse) return;

    CodeMirror.defineSimpleMode("tse", {
        start: [
            { regex: /\d*\.?\d+/g, token: "numbers" },
            { regex: /({=\(comment\):).*}/gi, token: "comment" },
            { regex: /\{/g, token: "lb brackets" },
            { regex: /\}/g, token: "rb brackets" },
            { regex: /\(/g, token: "lp operators" },
            { regex: /\)/g, token: "rp operators" },
            { regex: /:/g, token: "colon operators" },
            { regex: /(==|!=|>=?|<=?|[+\-*/%^])/g, token: "operators" },
            { regex: /(m|math|\+|m)(?=(:|\(|\}))/g, token: "blocks mathblock" },
            {
                regex: /(unix|uses|args|message|join|replace|if|any|all|and|or|break|contains|strf|#|random|rand|urlencode|td|index|list|cycle|=|let|assign|in|upper|lower|50:|c|cmd|redirect|require|blacklist|react|reactu|dm|delete|silent|silence|override|lvl|range)(?=(:|\(|\}))/g,
                token: "blocks",
            },
            {
                regex: /(user|target|server)(?=(:|\(|\}))/g,
                token: "blocks canparam",
            },
            {
                regex: /(avatar|id|created_at|joined_at|roleids|color|name|proper|position|icon|owner|randomonline|randomoffline|members|bots|humans|roles|channels|topic|slowmode|mention)(?=\))/g,
                token: "parameters",
            },
            { regex: /(trunc|round|abs)/g, token: "math" },
            { regex: /(true|false)/g, token: "boolean" },
            { regex: /(https?)/g, token: "http" },
            {
                regex: /(%a|%A|%w|%d|%-d|%b|%B|%m|%-m|%y|%Y|%H|%-H|%I|%-I|%p|%M|%-M|%S|%-S|%f|%z|%Z|%j|%-j|%U|%W|%c|%x|%X|%u|%n|%i|%s)/g,
                token: "strf",
            },
            { regex: /.+?/, token: "text" },
        ],
    });
}
