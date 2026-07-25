package com.urbansync.caretaker;

import java.util.List;

public interface CaretakerService {

    CaretakerDTO create(CaretakerCreateRequest request);

    List<CaretakerDTO> getAllCaretakers();

    CaretakerDTO getById(Long id);

}