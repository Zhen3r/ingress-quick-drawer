links = [
    [from, to],
    [from, to],
    [from, to],
]

portals = [
    {id: ..., lat: ..., lon: ..., name: ..., from: ..., to: ...},
    {id: ..., lat: ..., lon: ..., name: ..., from: ..., to: ...},
    {id: ..., lat: ..., lon: ..., name: ..., from: ..., to: ...},
]

fields = [
    [point1, point2, point3],
    [point1, point2, point3],
    [point1, point2, point3],
]

logs = [
    {type: "go", from: ..., to: ..., len: ...},
    {type: "link", from: ..., to: ..., len: ...},
    {type: "link", from: ..., to: ..., len: ...},
    {type: "link", from: ..., to: ..., len: ...},
    {type: "go", from: ..., to: ..., len: ...},
]

- when 2 portals are clicked
    - check if they are the same
    - check if they are already connected
    - check connection limit of portals
    - calc the len of link
    - check if the start portal is under field
        - if yes, assert len of link <= 500m
    - check if the new link cross existing links
    - add link to links
    - get left/right larget field, add fields
        - search for new closed loop
        - determine the orientation(left/right) of the new field
        - for each orientation, choose the one with larger area
    - update portals, stats, logs








